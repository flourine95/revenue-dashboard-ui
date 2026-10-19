import type { DashboardResponse, EventDto } from "@/lib/api/types"

export type ChartRow = {
  date: string
  pos: number
  eatclub: number
  labour: number
  total: number
  prevPos: number
  prevTotal: number
  prevLabour: number
  event: EventDto | null
}

/**
 * Joins the current period with the equal-length previous period, one row per
 * day. The API already zero-fills both series, so the indexes line up.
 */
export function buildChartRows(data: DashboardResponse): ChartRow[] {
  const previous = data.comparison?.series ?? []

  const firstEventByDate = new Map<string, EventDto>()
  for (const event of data.events) {
    if (!firstEventByDate.has(event.date))
      firstEventByDate.set(event.date, event)
  }

  return data.series.map((day, index) => {
    const before = previous[index]
    return {
      date: day.date,
      pos: day.posRevenue,
      eatclub: day.eatclubRevenue,
      labour: day.labourCost,
      total: day.posRevenue + day.eatclubRevenue,
      prevPos: before?.posRevenue ?? 0,
      prevTotal: (before?.posRevenue ?? 0) + (before?.eatclubRevenue ?? 0),
      prevLabour: before?.labourCost ?? 0,
      event: firstEventByDate.get(day.date) ?? null,
    }
  })
}

export type SeriesVisibility = {
  pos: boolean
  eatclub: boolean
  labour: boolean
}
