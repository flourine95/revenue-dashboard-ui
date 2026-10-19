/**
 * DTO types mirroring the REST API responses.
 * See revenue-dashboard-api/README.md for the endpoint contract.
 */

export type User = {
  id: string
  email: string
  name: string
}

export type Period = {
  from: string
  to: string
}

export type MetricDto = {
  date: string
  posRevenue: number
  eatclubRevenue: number
  labourCost: number
  covers: number
}

export type EventDto = {
  id: string
  date: string
  type: "positive" | "negative"
  title: string
  description: string | null
}

export type Kpis = {
  totalRevenue: number
  averagePerDay: number
  totalCovers: number
}

export type KpiDeltas = {
  totalRevenue: number | null
  averagePerDay: number | null
  totalCovers: number | null
}

export type DashboardResponse = {
  period: Period
  kpis: Kpis
  series: MetricDto[]
  events: EventDto[]
  budget: { weeklyRevenue: number }
  comparison?: {
    period: Period
    kpis: Kpis
    series: MetricDto[]
    deltas: KpiDeltas
  }
}

export type YearOverYearResponse = {
  period: Period
  kpis: Kpis
  series: MetricDto[]
  current: {
    period: Period
    kpis: Kpis
  }
  deltas: KpiDeltas
}

/** Body written by the admin upsert endpoint. */
export type MetricInput = {
  posRevenue: number
  eatclubRevenue: number
  labourCost: number
  covers: number
}

export type EventInput = {
  date: string
  type: "positive" | "negative"
  title: string
  description?: string | null
}

export type LoginResponse = { user: User }
export type MeResponse = { user: User }
export type AdminMetricsResponse = { metrics: MetricDto[] }
export type AdminMetricResponse = { metric: MetricDto }
export type AdminEventsResponse = { events: EventDto[] }
export type AdminEventResponse = { event: EventDto }
