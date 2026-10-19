import { describe, expect, it } from "vitest"
import { buildChartRows } from "@/lib/dashboard-data"
import { makeDashboard, metric } from "./fixtures"

describe("buildChartRows", () => {
  it("joins the current and previous series by index", () => {
    const rows = buildChartRows(
      makeDashboard({
        series: [
          metric("2026-10-19", {
            posRevenue: 1000,
            eatclubRevenue: 200,
            labourCost: 300,
            covers: 50,
          }),
        ],
        comparison: {
          period: { from: "2026-10-12", to: "2026-10-18" },
          kpis: { totalRevenue: 900, averagePerDay: 900, totalCovers: 40 },
          series: [
            metric("2026-10-12", {
              posRevenue: 700,
              eatclubRevenue: 200,
              labourCost: 250,
              covers: 40,
            }),
          ],
          deltas: { totalRevenue: 11.1, averagePerDay: 11.1, totalCovers: 25 },
        },
      })
    )

    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({
      total: 1200,
      prevPos: 700,
      prevTotal: 900,
      prevLabour: 250,
    })
  })

  it("zero-fills the previous period when comparison is off", () => {
    const rows = buildChartRows(
      makeDashboard({
        comparison: undefined,
      })
    )

    expect(rows[0]).toMatchObject({ prevPos: 0, prevTotal: 0, prevLabour: 0 })
  })

  it("attaches the first event of each day", () => {
    const rows = buildChartRows(
      makeDashboard({
        events: [
          {
            id: "event-1",
            date: "2026-10-19",
            type: "positive",
            title: "Local festival",
            description: null,
          },
          {
            id: "event-2",
            date: "2026-10-19",
            type: "negative",
            title: "Second event",
            description: null,
          },
        ],
      })
    )

    expect(rows[0].event?.id).toBe("event-1")
  })
})
