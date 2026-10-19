import { describe, expect, it } from "vitest"
import { performanceScore } from "@/lib/score"
import { makeDashboard, metric } from "./fixtures"

describe("performanceScore", () => {
  it("scores budget attainment, labour efficiency and covers together", () => {
    const result = performanceScore(
      makeDashboard({
        series: [
          metric("2026-10-19", {
            posRevenue: 18000,
            labourCost: 5400,
            covers: 900,
          }),
        ],
        kpis: { totalRevenue: 18000, averagePerDay: 18000, totalCovers: 900 },
        comparison: {
          period: { from: "2026-10-12", to: "2026-10-18" },
          kpis: { totalRevenue: 16000, averagePerDay: 16000, totalCovers: 800 },
          series: [],
          deltas: { totalRevenue: 12.5, averagePerDay: 12.5, totalCovers: 10 },
        },
      })
    )

    expect(result.score).toBe(90)
    expect(result.grade).toBe("A")
    expect(result.components.map((part) => part.weight)).toEqual([
      0.5, 0.3, 0.2,
    ])
    expect(result.components[0].detail).toContain("90%")
  })

  it("penalises an expensive labour ratio and falling covers", () => {
    const result = performanceScore(
      makeDashboard({
        series: [
          metric("2026-10-19", {
            posRevenue: 10000,
            labourCost: 5000,
            covers: 500,
          }),
        ],
        kpis: { totalRevenue: 10000, averagePerDay: 10000, totalCovers: 500 },
        comparison: {
          period: { from: "2026-10-12", to: "2026-10-18" },
          kpis: { totalRevenue: 10000, averagePerDay: 10000, totalCovers: 600 },
          series: [],
          deltas: { totalRevenue: 0, averagePerDay: 0, totalCovers: -10 },
        },
      })
    )

    expect(result.score).toBe(40)
    expect(result.grade).toBe("D")
  })

  it("uses a neutral covers score without a comparison period", () => {
    const result = performanceScore(
      makeDashboard({
        series: [],
        kpis: { totalRevenue: 0, averagePerDay: 0, totalCovers: 0 },
        comparison: undefined,
      })
    )

    expect(result.score).toBe(10)
    expect(result.components[2].detail).toBe("No comparison period")
  })
})
