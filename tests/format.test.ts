import { describe, expect, it } from "vitest"
import {
  formatAxisTick,
  formatCurrency,
  formatDayLabel,
  formatDelta,
  formatNumber,
} from "@/lib/format"

describe("formatCurrency", () => {
  it("rounds to whole dollars", () => {
    expect(formatCurrency(18336)).toBe("$18,336")
    expect(formatCurrency(2619.43)).toBe("$2,619")
  })
})

describe("formatNumber", () => {
  it("groups thousands", () => {
    expect(formatNumber(1000)).toBe("1,000")
    expect(formatNumber(986)).toBe("986")
  })
})

describe("formatDelta", () => {
  it("keeps the sign and one decimal", () => {
    expect(formatDelta(10.6)).toBe("+10.6%")
    expect(formatDelta(-4.2)).toBe("-4.2%")
    expect(formatDelta(0)).toBe("0.0%")
  })

  it("returns null without a baseline", () => {
    expect(formatDelta(null)).toBeNull()
  })
})

describe("formatAxisTick", () => {
  it("uses compact thousands", () => {
    expect(formatAxisTick(0)).toBe("0k")
    expect(formatAxisTick(750)).toBe("0.75k")
    expect(formatAxisTick(1500)).toBe("1.5k")
    expect(formatAxisTick(3000)).toBe("3k")
    expect(formatAxisTick(500)).toBe("0.5k")
  })
})

describe("formatDayLabel", () => {
  it("returns the short weekday", () => {
    expect(formatDayLabel("2026-10-19")).toBe("Mon")
  })
})
