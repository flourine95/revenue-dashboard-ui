"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  CircleAlert,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react"
import { PeriodNav } from "@/components/dashboard/period-nav"
import { UserMenu } from "@/components/dashboard/user-menu"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  deleteAdminEvent,
  deleteAdminMetric,
  getAdminEvents,
  getAdminMetrics,
  logout,
} from "@/lib/api/endpoints"
import { ApiError } from "@/lib/api/error"
import type { EventDto, MetricDto, User } from "@/lib/api/types"
import { formatCurrency, formatNumber } from "@/lib/format"
import {
  currentWeek,
  datesInRange,
  formatRange,
  shiftWeek,
  type DateRange,
} from "@/lib/period"
import { cn } from "@/lib/utils"
import { ConfirmDialog } from "./confirm-dialog"
import { EventDialog } from "./event-dialog"
import { MetricDialog } from "./metric-dialog"

type MetricDialogState =
  { mode: "create"; date: string } | { mode: "edit"; metric: MetricDto }

type EventDialogState = { mode: "create" } | { mode: "edit"; event: EventDto }

type ConfirmState =
  { kind: "metric"; date: string } | { kind: "event"; event: EventDto }

function weekday(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
  })
}

function shortDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

function IconButton({
  label,
  onClick,
  danger = false,
  children,
}: {
  label: string
  onClick: () => void
  danger?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        "grid size-7 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ink/40 focus-visible:outline-none dark:hover:bg-white/10",
        danger && "hover:bg-destructive/10 hover:text-destructive"
      )}
    >
      {children}
    </button>
  )
}

export function AdminScreen({
  user,
  initialRange,
  initialMetrics,
  initialEvents,
}: {
  user: User
  initialRange: DateRange
  initialMetrics: MetricDto[]
  initialEvents: EventDto[]
}) {
  const router = useRouter()
  const [range, setRange] = useState<DateRange>(initialRange)
  const [metrics, setMetrics] = useState<MetricDto[]>(initialMetrics)
  const [events, setEvents] = useState<EventDto[]>(initialEvents)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [metricDialog, setMetricDialog] = useState<MetricDialogState | null>(
    null
  )
  const [eventDialog, setEventDialog] = useState<EventDialogState | null>(null)
  const [confirm, setConfirm] = useState<ConfirmState | null>(null)

  const rangeKey = `${range.from}:${range.to}`
  const loadedRange = useRef(`${initialRange.from}:${initialRange.to}`)

  const load = useCallback(
    async (nextRange: DateRange) => {
      setLoading(true)
      setError(null)

      try {
        const [metricsResponse, eventsResponse] = await Promise.all([
          getAdminMetrics(nextRange),
          getAdminEvents(nextRange),
        ])
        setMetrics(metricsResponse.metrics)
        setEvents(eventsResponse.events)
        loadedRange.current = `${nextRange.from}:${nextRange.to}`
      } catch (cause) {
        if (cause instanceof ApiError && cause.status === 401) {
          router.replace("/login")
          router.refresh()
          return
        }
        setError(
          cause instanceof ApiError
            ? cause.message
            : "Could not load the admin data."
        )
      } finally {
        setLoading(false)
      }
    },
    [router]
  )

  useEffect(() => {
    if (loadedRange.current === rangeKey) return
    void load(range)
  }, [rangeKey, range, load])

  async function handleLogout() {
    try {
      await logout()
    } catch {
      // Session may already be gone.
    }
    router.replace("/login")
    router.refresh()
  }

  const days = datesInRange(range)
  const metricsByDate = new Map(metrics.map((metric) => [metric.date, metric]))
  const totals = metrics.reduce(
    (total, metric) => ({
      pos: total.pos + metric.posRevenue,
      eatclub: total.eatclub + metric.eatclubRevenue,
      labour: total.labour + metric.labourCost,
      covers: total.covers + metric.covers,
    }),
    { pos: 0, eatclub: 0, labour: 0, covers: 0 }
  )

  const firstMissingDay = days.find((day) => !metricsByDate.has(day))

  function openCreateMetric(date?: string) {
    setMetricDialog({
      mode: "create",
      date: date ?? firstMissingDay ?? range.from,
    })
  }

  async function handleMetricSaved() {
    setMetricDialog(null)
    await load(range)
  }

  async function handleEventSaved() {
    setEventDialog(null)
    await load(range)
  }

  async function handleDelete() {
    if (confirm === null) return
    if (confirm.kind === "metric") {
      await deleteAdminMetric(confirm.date)
    } else {
      await deleteAdminEvent(confirm.event.id)
    }
    await load(range)
  }

  return (
    <div className="min-h-svh bg-surface">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            prefetch={false}
            className="flex items-center gap-3 rounded-2xl focus-visible:ring-2 focus-visible:ring-ink/40 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <span className="grid size-10 place-items-center rounded-2xl bg-ink text-white shadow-sm">
              <TrendingUp className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold tracking-tight">
                Revenue Dashboard
              </p>
              <p className="text-[11px] text-muted-foreground sm:text-xs">
                Data administration
              </p>
            </div>
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/"
              prefetch={false}
              className="inline-flex h-8 items-center gap-1.5 rounded-full border border-black/10 bg-white/70 px-3 text-xs font-medium text-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-black/[0.03] focus-visible:ring-2 focus-visible:ring-ink/40 focus-visible:ring-offset-2 focus-visible:outline-none dark:border-white/10 dark:bg-white/5"
            >
              <ArrowLeft className="size-3.5" />
              Dashboard
            </Link>
            <UserMenu user={user} onLogout={handleLogout} />
          </div>
        </header>

        <main id="main-content">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
                Admin
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                Manage data
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Correct daily metrics and annotate the chart with events.
              </p>
            </div>
            <PeriodNav
              range={range}
              onShift={(weeks) =>
                setRange((current) => shiftWeek(current, weeks))
              }
              onToday={() => setRange(currentWeek())}
              pending={loading}
            />
          </div>

          {error !== null && (
            <div
              role="alert"
              className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
            >
              <span className="inline-flex items-center gap-2">
                <CircleAlert className="size-4 shrink-0" />
                {error}
              </span>
              <button
                type="button"
                onClick={() => void load(range)}
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium text-foreground ring-1 ring-black/10 hover:bg-black/[0.03] focus-visible:ring-2 focus-visible:ring-ink/40 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <Loader2 className="size-3" />
                Retry
              </button>
            </div>
          )}

          <div
            aria-busy={loading}
            className={cn(
              "grid gap-5 transition-opacity xl:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)]",
              loading && "opacity-60"
            )}
          >
            <section className="min-w-0 rounded-3xl bg-card p-5 shadow-sm ring-1 ring-foreground/5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold tracking-tight">
                    Daily metrics
                  </h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatRange(range)} · {metrics.length} of {days.length}{" "}
                    days recorded
                  </p>
                </div>
                <Button size="sm" onClick={() => openCreateMetric()}>
                  <Plus className="size-3.5" />
                  Add day
                </Button>
              </div>

              <div className="mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead scope="col">Day</TableHead>
                      <TableHead scope="col" className="text-right">
                        POS
                      </TableHead>
                      <TableHead scope="col" className="text-right">
                        Eatclub
                      </TableHead>
                      <TableHead scope="col" className="text-right">
                        Labour
                      </TableHead>
                      <TableHead scope="col" className="text-right">
                        Covers
                      </TableHead>
                      <TableHead scope="col" className="w-20 text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {days.map((day) => {
                      const metric = metricsByDate.get(day)

                      if (metric === undefined) {
                        return (
                          <TableRow key={day} className="text-muted-foreground">
                            <TableCell>
                              <span className="font-medium text-foreground">
                                {weekday(day)}
                              </span>{" "}
                              <span className="text-xs">{shortDate(day)}</span>
                            </TableCell>
                            <TableCell
                              colSpan={4}
                              className="text-xs text-muted-foreground"
                            >
                              No data
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="xs"
                                onClick={() => openCreateMetric(day)}
                              >
                                <Plus className="size-3" />
                                Add
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      }

                      return (
                        <TableRow key={day}>
                          <TableCell>
                            <span className="font-medium">{weekday(day)}</span>{" "}
                            <span className="text-xs text-muted-foreground">
                              {shortDate(day)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {formatCurrency(metric.posRevenue)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {formatCurrency(metric.eatclubRevenue)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {formatCurrency(metric.labourCost)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {formatNumber(metric.covers)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <IconButton
                                label={`Edit ${weekday(day)} ${shortDate(day)}`}
                                onClick={() =>
                                  setMetricDialog({ mode: "edit", metric })
                                }
                              >
                                <Pencil className="size-3.5" />
                              </IconButton>
                              <IconButton
                                danger
                                label={`Delete ${weekday(day)} ${shortDate(day)}`}
                                onClick={() =>
                                  setConfirm({ kind: "metric", date: day })
                                }
                              >
                                <Trash2 className="size-3.5" />
                              </IconButton>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                  {metrics.length > 0 && (
                    <TableFooter>
                      <TableRow>
                        <TableCell className="text-xs font-medium">
                          Week total
                        </TableCell>
                        <TableCell className="text-right text-xs tabular-nums">
                          {formatCurrency(totals.pos)}
                        </TableCell>
                        <TableCell className="text-right text-xs tabular-nums">
                          {formatCurrency(totals.eatclub)}
                        </TableCell>
                        <TableCell className="text-right text-xs tabular-nums">
                          {formatCurrency(totals.labour)}
                        </TableCell>
                        <TableCell className="text-right text-xs tabular-nums">
                          {formatNumber(totals.covers)}
                        </TableCell>
                        <TableCell />
                      </TableRow>
                    </TableFooter>
                  )}
                </Table>
              </div>

              <p className="mt-3 text-[11px] text-muted-foreground">
                Saving replaces the whole day. Days without a row are counted as
                zero on the dashboard.
              </p>
            </section>

            <section className="min-w-0 rounded-3xl bg-card p-5 shadow-sm ring-1 ring-foreground/5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold tracking-tight">
                    Events
                  </h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatRange(range)} · {events.length} event
                    {events.length === 1 ? "" : "s"}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setEventDialog({ mode: "create" })}
                >
                  <Plus className="size-3.5" />
                  New event
                </Button>
              </div>

              {events.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-dashed border-black/10 px-4 py-10 text-center text-sm text-muted-foreground dark:border-white/10">
                  No events this week.
                </div>
              ) : (
                <ul className="mt-4 space-y-2">
                  {events.map((event) => {
                    const positive = event.type === "positive"

                    return (
                      <li
                        key={event.id}
                        className="rounded-2xl border border-black/5 px-3 py-3 dark:border-white/10"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                              <span
                                className={cn(
                                  "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 font-medium",
                                  positive
                                    ? "bg-positive/10 text-positive"
                                    : "bg-negative/10 text-negative"
                                )}
                              >
                                {positive ? (
                                  <TrendingUp className="size-3" />
                                ) : (
                                  <TrendingDown className="size-3" />
                                )}
                                {positive ? "Positive" : "Negative"}
                              </span>
                              <span>
                                {weekday(event.date)}, {shortDate(event.date)}
                              </span>
                            </div>
                            <p className="mt-1 text-sm font-medium break-words">
                              {event.title}
                            </p>
                            {event.description !== null && (
                              <p className="mt-0.5 line-clamp-2 text-xs break-words text-muted-foreground">
                                {event.description}
                              </p>
                            )}
                          </div>

                          <div className="flex shrink-0 gap-1">
                            <IconButton
                              label={`Edit ${event.title}`}
                              onClick={() =>
                                setEventDialog({ mode: "edit", event })
                              }
                            >
                              <Pencil className="size-3.5" />
                            </IconButton>
                            <IconButton
                              danger
                              label={`Delete ${event.title}`}
                              onClick={() =>
                                setConfirm({ kind: "event", event })
                              }
                            >
                              <Trash2 className="size-3.5" />
                            </IconButton>
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>
          </div>
        </main>
      </div>

      {metricDialog !== null && (
        <MetricDialog
          date={
            metricDialog.mode === "edit"
              ? metricDialog.metric.date
              : metricDialog.date
          }
          metric={
            metricDialog.mode === "edit" ? metricDialog.metric : undefined
          }
          onClose={() => setMetricDialog(null)}
          onSaved={handleMetricSaved}
        />
      )}

      {eventDialog !== null && (
        <EventDialog
          date={range.from}
          event={eventDialog.mode === "edit" ? eventDialog.event : undefined}
          onClose={() => setEventDialog(null)}
          onSaved={handleEventSaved}
        />
      )}

      {confirm !== null && (
        <ConfirmDialog
          title={
            confirm.kind === "metric"
              ? `Delete ${weekday(confirm.date)} ${shortDate(confirm.date)}?`
              : `Delete “${confirm.event.title}”?`
          }
          description={
            confirm.kind === "metric"
              ? "This removes the day from the dashboard. The chart will treat it as zero."
              : "This removes the event annotation from the chart."
          }
          onConfirm={handleDelete}
          onClose={() => setConfirm(null)}
        />
      )}
    </div>
  )
}
