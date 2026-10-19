import type { DashboardResponse, MetricDto } from "@/lib/api/types"

export function metric(
  date: string,
  values: Partial<Omit<MetricDto, "date">> = {}
): MetricDto {
  return {
    date,
    posRevenue: 0,
    eatclubRevenue: 0,
    labourCost: 0,
    covers: 0,
    ...values,
  }
}

const CURRENT = "2026-10-19"
const PREVIOUS = "2026-10-12"

export function makeDashboard(
  overrides: Partial<DashboardResponse> = {}
): DashboardResponse {
  return {
    period: { from: CURRENT, to: "2026-10-25" },
    kpis: { totalRevenue: 1200, averagePerDay: 1200, totalCovers: 50 },
    series: [
      metric(CURRENT, {
        posRevenue: 1000,
        eatclubRevenue: 200,
        labourCost: 300,
        covers: 50,
      }),
    ],
    events: [],
    budget: { weeklyRevenue: 20000 },
    comparison: {
      period: { from: PREVIOUS, to: "2026-10-18" },
      kpis: { totalRevenue: 1000, averagePerDay: 1000, totalCovers: 40 },
      series: [
        metric(PREVIOUS, {
          posRevenue: 800,
          eatclubRevenue: 200,
          labourCost: 280,
          covers: 40,
        }),
      ],
      deltas: { totalRevenue: 20, averagePerDay: 20, totalCovers: 25 },
    },
    ...overrides,
  }
}
