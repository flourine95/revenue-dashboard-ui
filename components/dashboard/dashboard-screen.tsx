"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AlertCircle, BarChart3, RotateCcw, Settings2 } from "lucide-react"
import { getDashboard, logout } from "@/lib/api/endpoints"
import { ApiError } from "@/lib/api/error"
import type { DashboardResponse, User } from "@/lib/api/types"
import { currentWeek, shiftWeek, type DateRange } from "@/lib/period"
import { InsightsTabs } from "./insights-tabs"
import { PeriodNav } from "./period-nav"
import { RevenueCard } from "./revenue-card"
import { UserMenu } from "./user-menu"

type DashboardScreenProps = {
  user: User
  initialRange: DateRange
  initialData: DashboardResponse
}

export function DashboardScreen({
  user,
  initialRange,
  initialData,
}: DashboardScreenProps) {
  const router = useRouter()
  const [range, setRange] = useState<DateRange>(initialRange)
  const [compare, setCompare] = useState(true)
  const [data, setData] = useState<DashboardResponse>(initialData)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  // The comparison payload is always fetched. Toggling "Compare to Previous"
  // only changes what is rendered, so the layout never reflows and there is no
  // extra round-trip when the toggle is pressed.
  const requestKey = `${range.from}:${range.to}:${attempt}`
  const loadedKey = useRef(`${initialRange.from}:${initialRange.to}:0`)

  useEffect(() => {
    if (requestKey === loadedKey.current) return

    let cancelled = false
    setPending(true)
    setError(null)

    getDashboard(range, true)
      .then((next) => {
        if (cancelled) return
        setData(next)
        loadedKey.current = requestKey
        setPending(false)
      })
      .catch((cause: unknown) => {
        if (cancelled) return
        setPending(false)

        if (cause instanceof ApiError && cause.status === 401) {
          router.replace("/login")
          router.refresh()
          return
        }

        setError(
          cause instanceof ApiError
            ? cause.message
            : "Unable to reach the API. Check that it is running on port 4000."
        )
      })

    return () => {
      cancelled = true
    }
  }, [requestKey, range, router])

  async function handleLogout() {
    try {
      await logout()
    } catch {
      // The session may already be gone; the redirect below still applies.
    }
    router.replace("/login")
    router.refresh()
  }

  return (
    <div className="min-h-svh bg-surface">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-ink text-white shadow-sm">
              <BarChart3 className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold tracking-tight">
                Revenue Dashboard
              </p>
              <p className="text-[11px] text-muted-foreground sm:text-xs">
                Weekly performance overview
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <PeriodNav
              range={range}
              onShift={(weeks) =>
                setRange((current) => shiftWeek(current, weeks))
              }
              onToday={() => setRange(currentWeek())}
              pending={pending}
            />
            <UserMenu user={user} onLogout={handleLogout} />
            <Link
              href="/admin"
              prefetch={false}
              aria-label="Manage data"
              className="inline-flex h-8 items-center gap-1.5 rounded-full border border-black/10 bg-white/70 px-3 text-xs font-medium text-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-black/[0.03] dark:border-white/10 dark:bg-white/5"
            >
              <Settings2 className="size-3.5" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          </div>
        </header>

        {error !== null && (
          <div
            role="alert"
            className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          >
            <span className="inline-flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              {error}
            </span>
            <button
              type="button"
              onClick={() => setAttempt((value) => value + 1)}
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium text-foreground ring-1 ring-black/10 hover:bg-black/[0.03]"
            >
              <RotateCcw className="size-3" />
              Retry
            </button>
          </div>
        )}

        <RevenueCard
          data={data}
          compare={compare}
          onCompareChange={setCompare}
          range={range}
          pending={pending}
        />

        <InsightsTabs data={data} range={range} />

        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          Demo data seeded relative to today · amounts in USD
        </p>
      </div>
    </div>
  )
}
