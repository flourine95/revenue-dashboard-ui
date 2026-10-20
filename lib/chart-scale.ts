import type { ChartRow } from "@/lib/dashboard-data"

/**
 * The reference design pins the axis to a 3k ceiling with 0.75k steps, so
 * every week is read against the same scale. Weeks whose tallest bar would
 * stay below the ceiling keep that scale; taller weeks stretch the axis in
 * whole 0.75k steps until the bars fit.
 */
const REFERENCE_MAX = 3000
const REFERENCE_STEP = 750
const SCALE_HEADROOM = 1.04

export type ChartScale = { max: number; step: number; ticks: number[] }

function ticksFor(max: number, step: number): number[] {
  return Array.from({ length: Math.round(max / step) + 1 }, (_, i) => i * step)
}

function tallestValue(rows: ChartRow[]): number {
  return rows.reduce(
    (max, row) =>
      Math.max(max, row.total, row.labour, row.prevTotal, row.prevLabour),
    0
  )
}

export function buildScale(rows: ChartRow[]): ChartScale {
  const peak = tallestValue(rows)

  // Stay on the reference scale unless a bar would actually reach the
  // ceiling: a week peaking at 3.6k is still legible against a 0..4.5k axis
  // with 0.75k steps, which keeps the reference proportions.
  if (peak <= REFERENCE_MAX) {
    return {
      max: REFERENCE_MAX,
      step: REFERENCE_STEP,
      ticks: ticksFor(REFERENCE_MAX, REFERENCE_STEP),
    }
  }

  // Grow in whole reference steps so every tick stays on the 0.75k grid.
  const steps = Math.ceil((peak * SCALE_HEADROOM) / REFERENCE_STEP)
  const max = steps * REFERENCE_STEP

  return { max, step: REFERENCE_STEP, ticks: ticksFor(max, REFERENCE_STEP) }
}
