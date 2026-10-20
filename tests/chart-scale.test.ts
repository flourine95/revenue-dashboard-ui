import { describe, expect, it } from "vitest"
import { buildScale } from "@/lib/chart-scale"
import type { ChartRow } from "@/lib/dashboard-data"

function row(values: Partial<ChartRow> = {}): ChartRow {
  return {
    date: "2026-10-19",
    pos: 0,
    eatclub: 0,
    labour: 0,
    total: 0,
    prevPos: 0,
    prevTotal: 0,
    prevLabour: 0,
    event: null,
    ...values,
  }
}

describe("buildScale", () => {
  it("uses the reference 0.75k steps when the bars fit under 3k", () => {
    const scale = buildScale([row({ total: 2870 })])

    expect(scale.max).toBe(3000)
    expect(scale.step).toBe(750)
    expect(scale.ticks).toEqual([0, 750, 1500, 2250, 3000])
  })

  it("grows in whole 0.75k steps when a bar passes the ceiling", () => {
    const scale = buildScale([row({ total: 3627 })])

    expect(scale.max).toBeGreaterThanOrEqual(3627)
    expect(scale.max % 750).toBe(0)
    expect(scale.ticks.every((tick) => tick % 750 === 0)).toBe(true)
    expect(scale.ticks[scale.ticks.length - 1]).toBe(scale.max)
  })

  it("keeps the reference scale for an empty week", () => {
    const scale = buildScale([])

    expect(scale.max).toBe(3000)
    expect(scale.ticks).toHaveLength(5)
  })

  it("considers the previous labour bar when sizing the axis", () => {
    const scale = buildScale([row({ total: 100, prevLabour: 3500 })])

    expect(scale.max).toBeGreaterThanOrEqual(3500)
  })
})
