import type { DateRange } from "@/lib/period"

/** Shared between the server page and the client refetch. */
export function dashboardPath(range: DateRange, compare: boolean): string {
  const params = new URLSearchParams({
    from: range.from,
    to: range.to,
    compare: String(compare),
  })
  return `/api/dashboard?${params.toString()}`
}
