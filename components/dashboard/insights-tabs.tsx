"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeftRight,
  CalendarRange,
  Gauge,
  Loader2,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react"
import type { ReactNode } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getYearOverYear } from "@/lib/api/endpoints"
import { ApiError } from "@/lib/api/error"
import type { DashboardResponse, YearOverYearResponse } from "@/lib/api/types"
import { formatCurrency, formatDelta, formatNumber } from "@/lib/format"
import { formatRange, type DateRange } from "@/lib/period"
import { performanceScore } from "@/lib/score"
import { cn } from "@/lib/utils"

type TabKey = "comparison" | "year" | "budget" | "score"

function Delta({ value }: { value: number | null }) {
  const text = formatDelta(value)
  if (text === null) {
    return <span className="text-sm text-muted-foreground">—</span>
  }

  const positive = (value ?? 0) >= 0
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-sm font-medium tabular-nums",
        positive ? "text-positive" : "text-negative"
      )}
    >
      {positive ? (
        <TrendingUp className="size-3.5" />
      ) : (
        <TrendingDown className="size-3.5" />
      )}
      {text}
    </span>
  )
}

function PanelHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h3 className="text-base font-semibold tracking-tight">{title}</h3>
        {subtitle !== undefined && (
          <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  )
}

type MetricRow = {
  label: string
  current: string
  previous: string
  delta: number | null
}

function MetricTable({
  rows,
  currentLabel,
  previousLabel,
}: {
  rows: MetricRow[]
  currentLabel: string
  previousLabel: string
}) {
  return (
    <div className="mt-4">
      <div className="hidden grid-cols-[1.4fr_1fr_1fr_0.8fr] gap-3 px-1 text-[11px] font-medium text-muted-foreground sm:grid">
        <span>Metric</span>
        <span className="text-right">{currentLabel}</span>
        <span className="text-right">{previousLabel}</span>
        <span className="text-right">Change</span>
      </div>

      <dl className="divide-y divide-black/5 dark:divide-white/5">
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid grid-cols-2 items-center gap-x-3 gap-y-1 py-3 sm:grid-cols-[1.4fr_1fr_1fr_0.8fr]"
          >
            <dt className="col-span-2 text-xs text-muted-foreground sm:col-span-1 sm:text-sm">
              {row.label}
            </dt>
            <dd className="text-sm font-medium tabular-nums sm:text-right">
              <span className="mr-1 text-[11px] text-muted-foreground sm:hidden">
                Cur.
              </span>
              {row.current}
            </dd>
            <dd className="text-right text-sm text-muted-foreground tabular-nums">
              <span className="mr-1 text-[11px] sm:hidden">Prev.</span>
              {row.previous}
            </dd>
            <dd className="col-span-2 text-right sm:col-span-1">
              <Delta value={row.delta} />
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function Stats({
  items,
}: {
  items: Array<{ label: string; value: string; tone?: "positive" | "negative" }>
}) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {items.map((item) => (
        <div key={item.label} className="rounded-xl bg-panel px-3 py-2.5">
          <p className="text-[11px] text-muted-foreground">{item.label}</p>
          <p
            className={cn(
              "mt-0.5 text-sm font-semibold tabular-nums",
              item.tone === "positive" && "text-positive",
              item.tone === "negative" && "text-negative"
            )}
          >
            {item.value}
          </p>
        </div>
      ))}
    </div>
  )
}

function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="mt-4 flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/10 px-6 py-10 text-center dark:border-white/10">
      <span className="grid size-10 place-items-center rounded-full bg-panel">
        <CalendarRange className="size-5 text-muted-foreground" />
      </span>
      <p className="mt-3 text-sm font-medium">{title}</p>
      <p className="mt-1 max-w-sm text-xs text-muted-foreground">
        {description}
      </p>
      {action !== undefined && <div className="mt-4">{action}</div>}
    </div>
  )
}

function ComparisonPanel({
  data,
  range,
}: {
  data: DashboardResponse
  range: DateRange
}) {
  const comparison = data.comparison

  if (comparison === undefined) {
    return (
      <div>
        <PanelHeader
          title="Period comparison"
          subtitle="How this week compares with the week before it."
        />
        <EmptyState
          title="No comparison available"
          description="The previous period could not be loaded for this range."
        />
      </div>
    )
  }

  const rows: MetricRow[] = [
    {
      label: "Total revenue",
      current: formatCurrency(data.kpis.totalRevenue),
      previous: formatCurrency(comparison.kpis.totalRevenue),
      delta: comparison.deltas.totalRevenue,
    },
    {
      label: "Average per day",
      current: formatCurrency(data.kpis.averagePerDay),
      previous: formatCurrency(comparison.kpis.averagePerDay),
      delta: comparison.deltas.averagePerDay,
    },
    {
      label: "Total covers",
      current: formatNumber(data.kpis.totalCovers),
      previous: formatNumber(comparison.kpis.totalCovers),
      delta: comparison.deltas.totalCovers,
    },
  ]

  return (
    <div>
      <PanelHeader
        title="Period comparison"
        subtitle={`${formatRange(range)} vs ${formatRange(comparison.period)}`}
      />
      <MetricTable
        rows={rows}
        currentLabel="This period"
        previousLabel="Previous"
      />
    </div>
  )
}

function YearOverYearPanel({
  data,
  range,
  yoy,
  loading,
  error,
}: {
  data: DashboardResponse
  range: DateRange
  yoy: YearOverYearResponse | null
  loading: boolean
  error: string | null
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Loading last year…
      </div>
    )
  }

  if (error !== null) {
    return (
      <div>
        <PanelHeader title="Year-over-year" />
        <p className="mt-4 rounded-xl bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      </div>
    )
  }

  if (yoy === null) return null

  if (yoy.kpis.totalRevenue === 0 && yoy.kpis.totalCovers === 0) {
    return (
      <div>
        <PanelHeader
          title="Year-over-year"
          subtitle={`Compared with ${formatRange(yoy.period)}`}
        />
        <EmptyState
          title="No data from a year ago"
          description="There are no metrics recorded for the same week last year, so a year-over-year comparison cannot be shown."
        />
      </div>
    )
  }

  const rows: MetricRow[] = [
    {
      label: "Total revenue",
      current: formatCurrency(data.kpis.totalRevenue),
      previous: formatCurrency(yoy.kpis.totalRevenue),
      delta: yoy.deltas.totalRevenue,
    },
    {
      label: "Average per day",
      current: formatCurrency(data.kpis.averagePerDay),
      previous: formatCurrency(yoy.kpis.averagePerDay),
      delta: yoy.deltas.averagePerDay,
    },
    {
      label: "Total covers",
      current: formatNumber(data.kpis.totalCovers),
      previous: formatNumber(yoy.kpis.totalCovers),
      delta: yoy.deltas.totalCovers,
    },
  ]

  return (
    <div>
      <PanelHeader
        title="Year-over-year"
        subtitle={`${formatRange(range)} vs ${formatRange(yoy.period)}`}
      />
      <MetricTable
        rows={rows}
        currentLabel="This week"
        previousLabel="Last year"
      />
    </div>
  )
}

function BudgetPanel({
  data,
  range,
}: {
  data: DashboardResponse
  range: DateRange
}) {
  const budget = data.budget.weeklyRevenue
  const revenue = data.kpis.totalRevenue
  const attainment = budget > 0 ? revenue / budget : 0
  const percentage = Math.round(attainment * 1000) / 10
  const remaining = budget - revenue
  const dailyTarget = budget / 7
  const status =
    attainment >= 1
      ? "Budget met"
      : attainment >= 0.85
        ? "Close to budget"
        : "Below budget"

  return (
    <div>
      <PanelHeader
        title="Budget performance"
        subtitle={`${formatRange(range)} · weekly target ${formatCurrency(budget)}`}
        action={
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-[11px] font-medium",
              attainment >= 1
                ? "bg-positive/10 text-positive"
                : attainment >= 0.85
                  ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                  : "bg-negative/10 text-negative"
            )}
          >
            {status}
          </span>
        }
      />

      <div className="mt-5 grid gap-6 lg:grid-cols-[1.25fr_1fr] lg:items-center">
        <div>
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-3xl font-semibold tracking-tight tabular-nums">
              {percentage.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">
              of {formatCurrency(budget)}
            </p>
          </div>

          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-black/[0.06] dark:bg-white/10">
            <div
              className={cn(
                "h-full rounded-full transition-[width] duration-500",
                attainment >= 1 ? "bg-positive" : "bg-ink"
              )}
              style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
            />
          </div>

          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>{formatCurrency(revenue)} earned</span>
            <span>{formatCurrency(budget)} budget</span>
          </div>
        </div>

        <Stats
          items={[
            {
              label: remaining >= 0 ? "Remaining" : "Over budget",
              value: formatCurrency(Math.abs(remaining)),
              tone: remaining >= 0 ? undefined : "negative",
            },
            {
              label: "Daily average",
              value: formatCurrency(data.kpis.averagePerDay),
            },
            { label: "Daily target", value: formatCurrency(dailyTarget) },
            {
              label: "Avg vs target",
              value:
                dailyTarget > 0
                  ? `${Math.round((data.kpis.averagePerDay / dailyTarget) * 100)}%`
                  : "—",
            },
          ]}
        />
      </div>
    </div>
  )
}

function ScoreRing({ score }: { score: number }) {
  return (
    <div
      className="grid size-28 shrink-0 place-items-center rounded-full text-ink"
      style={{
        background: `conic-gradient(currentColor ${score * 3.6}deg, color-mix(in srgb, currentColor 12%, transparent) 0deg)`,
      }}
    >
      <div className="grid size-[88px] place-items-center rounded-full bg-card">
        <div className="text-center">
          <p className="text-2xl font-semibold tabular-nums">{score}</p>
          <p className="text-[10px] text-muted-foreground">out of 100</p>
        </div>
      </div>
    </div>
  )
}

function ScorePanel({ data }: { data: DashboardResponse }) {
  const result = performanceScore(data)

  return (
    <div>
      <PanelHeader
        title="Performance score"
        subtitle="Revenue vs budget (50%), labour efficiency (30%) and covers momentum (20%)."
        action={
          <span className="rounded-full bg-ink px-2.5 py-1 text-[11px] font-medium text-white">
            {result.grade} · {result.gradeLabel}
          </span>
        }
      />

      <div className="mt-5 grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
        <ScoreRing score={result.score} />

        <div className="space-y-4">
          {result.components.map((component) => (
            <div key={component.key}>
              <div className="flex items-baseline justify-between gap-3 text-xs">
                <span className="font-medium">
                  {component.label}{" "}
                  <span className="font-normal text-muted-foreground">
                    {Math.round(component.weight * 100)}%
                  </span>
                </span>
                <span className="text-muted-foreground">
                  {component.detail}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-black/[0.06] dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-ink"
                  style={{ width: `${Math.round(component.value * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

type Props = {
  data: DashboardResponse
  range: DateRange
}

export function InsightsTabs({ data, range }: Props) {
  const router = useRouter()
  const [tab, setTab] = useState<TabKey>("comparison")
  const [yoy, setYoy] = useState<YearOverYearResponse | null>(null)
  const [yoyLoading, setYoyLoading] = useState(false)
  const [yoyError, setYoyError] = useState<string | null>(null)

  const yoyKey = `${range.from}:${range.to}`
  const loadedYoyKey = useRef<string | null>(null)
  const score = performanceScore(data)
  const budgetAttainment =
    data.budget.weeklyRevenue > 0
      ? Math.round((data.kpis.totalRevenue / data.budget.weeklyRevenue) * 100)
      : 100

  useEffect(() => {
    if (tab !== "year" || loadedYoyKey.current === yoyKey) return

    let cancelled = false
    setYoyLoading(true)
    setYoyError(null)
    setYoy(null)

    getYearOverYear(range)
      .then((next) => {
        if (cancelled) return
        setYoy(next)
        loadedYoyKey.current = yoyKey
        setYoyLoading(false)
      })
      .catch((cause: unknown) => {
        if (cancelled) return
        setYoyLoading(false)

        if (cause instanceof ApiError && cause.status === 401) {
          router.replace("/login")
          router.refresh()
          return
        }

        setYoyError(
          cause instanceof ApiError
            ? cause.message
            : "Unable to load year-over-year data."
        )
      })

    return () => {
      cancelled = true
    }
  }, [tab, range, yoyKey, router])

  return (
    <Tabs
      value={tab}
      onValueChange={(value) => setTab(value as TabKey)}
      className="mt-5"
    >
      <TabsList className="grid h-auto w-full grid-cols-2 gap-2 rounded-none bg-transparent p-0 group-data-horizontal/tabs:h-auto lg:grid-cols-4">
        <TabsTrigger
          value="comparison"
          className="group flex h-auto min-w-0 flex-1 flex-col items-start justify-start gap-0.5 rounded-2xl border border-black/5 bg-card px-4 py-3 text-left whitespace-normal text-foreground shadow-sm transition-all hover:bg-black/[0.02] dark:border-white/10 dark:hover:bg-white/[0.04] data-active:bg-card data-active:ring-2 data-active:ring-ink/80"
        >
          <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <ArrowLeftRight className="size-4 text-foreground" />
            Period Comparison
          </span>
          <span className="text-base font-semibold tracking-tight">
            {data.comparison === undefined
              ? "—"
              : (formatDelta(data.comparison.deltas.totalRevenue) ?? "—")}
          </span>
          <span className="text-[11px] text-muted-foreground">
            revenue vs previous week
          </span>
        </TabsTrigger>

        <TabsTrigger
          value="year"
          className="group flex h-auto min-w-0 flex-1 flex-col items-start justify-start gap-0.5 rounded-2xl border border-black/5 bg-card px-4 py-3 text-left whitespace-normal text-foreground shadow-sm transition-all hover:bg-black/[0.02] dark:border-white/10 dark:hover:bg-white/[0.04] data-active:bg-card data-active:ring-2 data-active:ring-ink/80"
        >
          <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <CalendarRange className="size-4 text-foreground" />
            Year-over-Year
          </span>
          <span className="text-base font-semibold tracking-tight">
            {yoy === null
              ? "vs last year"
              : (formatDelta(yoy.deltas.totalRevenue) ?? "—")}
          </span>
          <span className="text-[11px] text-muted-foreground">
            same week one year earlier
          </span>
        </TabsTrigger>

        <TabsTrigger
          value="budget"
          className="group flex h-auto min-w-0 flex-1 flex-col items-start justify-start gap-0.5 rounded-2xl border border-black/5 bg-card px-4 py-3 text-left whitespace-normal text-foreground shadow-sm transition-all hover:bg-black/[0.02] dark:border-white/10 dark:hover:bg-white/[0.04] data-active:bg-card data-active:ring-2 data-active:ring-ink/80"
        >
          <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Target className="size-4 text-foreground" />
            Budget Performance
          </span>
          <span className="text-base font-semibold tracking-tight">
            {budgetAttainment}%
          </span>
          <span className="text-[11px] text-muted-foreground">
            of weekly revenue budget
          </span>
        </TabsTrigger>

        <TabsTrigger
          value="score"
          className="group flex h-auto min-w-0 flex-1 flex-col items-start justify-start gap-0.5 rounded-2xl border border-black/5 bg-card px-4 py-3 text-left whitespace-normal text-foreground shadow-sm transition-all hover:bg-black/[0.02] dark:border-white/10 dark:hover:bg-white/[0.04] data-active:bg-card data-active:ring-2 data-active:ring-ink/80"
        >
          <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Gauge className="size-4 text-foreground" />
            Performance Score
          </span>
          <span className="text-base font-semibold tracking-tight">
            {score.score} / 100
          </span>
          <span className="text-[11px] text-muted-foreground">
            {score.gradeLabel}
          </span>
        </TabsTrigger>
      </TabsList>

      <TabsContent
        value="comparison"
        className="min-h-[26rem] rounded-3xl bg-card p-5 shadow-sm ring-1 ring-foreground/5 sm:min-h-[24rem] sm:p-6 lg:min-h-[22rem]"
      >
        <ComparisonPanel data={data} range={range} />
      </TabsContent>

      <TabsContent
        value="year"
        className="min-h-[26rem] rounded-3xl bg-card p-5 shadow-sm ring-1 ring-foreground/5 sm:min-h-[24rem] sm:p-6 lg:min-h-[22rem]"
      >
        <YearOverYearPanel
          data={data}
          range={range}
          yoy={yoy}
          loading={yoyLoading}
          error={yoyError}
        />
      </TabsContent>

      <TabsContent
        value="budget"
        className="min-h-[26rem] rounded-3xl bg-card p-5 shadow-sm ring-1 ring-foreground/5 sm:min-h-[24rem] sm:p-6 lg:min-h-[22rem]"
      >
        <BudgetPanel data={data} range={range} />
      </TabsContent>

      <TabsContent
        value="score"
        className="min-h-[26rem] rounded-3xl bg-card p-5 shadow-sm ring-1 ring-foreground/5 sm:min-h-[24rem] sm:p-6 lg:min-h-[22rem]"
      >
        <ScorePanel data={data} />
      </TabsContent>
    </Tabs>
  )
}
