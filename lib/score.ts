import type { DashboardResponse } from "@/lib/api/types"
import { formatCurrency, formatDelta } from "@/lib/format"

export type ScoreComponent = {
  key: string
  label: string
  detail: string
  weight: number
  /** Normalised 0–1 contribution before weighting. */
  value: number
}

export type PerformanceScore = {
  score: number
  grade: "A" | "B" | "C" | "D"
  gradeLabel: string
  components: ScoreComponent[]
}

const LABOUR_TARGET_RATIO = 0.3

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value))
}

const GRADE_LABELS: Record<PerformanceScore["grade"], string> = {
  A: "Excellent",
  B: "Healthy",
  C: "Needs attention",
  D: "At risk",
}

/**
 * A deliberately simple, explainable health score:
 *   50% revenue vs the weekly budget
 *   30% labour cost efficiency (30% of revenue is the target)
 *   20% covers momentum vs the previous period
 */
export function performanceScore(data: DashboardResponse): PerformanceScore {
  const budget = data.budget.weeklyRevenue
  const revenue = data.kpis.totalRevenue
  const labour = data.series.reduce((total, day) => total + day.labourCost, 0)
  const coversDelta = data.comparison?.deltas.totalCovers ?? null
  const labourRatio = revenue > 0 ? labour / revenue : 0

  const revenueValue = budget > 0 ? clamp01(revenue / budget) : 1
  const labourValue =
    revenue === 0
      ? 0
      : clamp01(
          1 -
            Math.max(0, labourRatio - LABOUR_TARGET_RATIO) / LABOUR_TARGET_RATIO
        )
  const coversValue =
    coversDelta === null ? 0.5 : clamp01(0.5 + coversDelta / 40)

  const components: ScoreComponent[] = [
    {
      key: "revenue",
      label: "Revenue vs budget",
      detail: `${Math.round(revenueValue * 100)}% of ${formatCurrency(budget)}`,
      weight: 0.5,
      value: revenueValue,
    },
    {
      key: "labour",
      label: "Labour efficiency",
      detail: `${Math.round(labourRatio * 100)}% of revenue (target 30%)`,
      weight: 0.3,
      value: labourValue,
    },
    {
      key: "covers",
      label: "Covers momentum",
      detail:
        coversDelta === null
          ? "No comparison period"
          : `${formatDelta(coversDelta)} vs previous period`,
      weight: 0.2,
      value: coversValue,
    },
  ]

  const score = Math.round(
    components.reduce(
      (total, component) => total + component.value * component.weight,
      0
    ) * 100
  )
  const grade: PerformanceScore["grade"] =
    score >= 85 ? "A" : score >= 70 ? "B" : score >= 55 ? "C" : "D"

  return { score, grade, gradeLabel: GRADE_LABELS[grade], components }
}
