import { describe, expect, it } from "vitest"
import {
  currentWeek,
  datesInRange,
  formatRange,
  isCurrentWeek,
  shiftWeek,
} from "@/lib/period"

const monday = new Date(2026, 9, 19, 12, 0, 0)

describe("currentWeek", () => {
  it("returns Monday through Sunday for the anchor date", () => {
    expect(currentWeek(monday)).toEqual({
      from: "2026-10-19",
      to: "2026-10-25",
    })
  })
})

describe("shiftWeek", () => {
  it("moves back and forward by whole weeks", () => {
    const week = currentWeek(monday)
    expect(shiftWeek(week, -1)).toEqual({
      from: "2026-10-12",
      to: "2026-10-18",
    })
    expect(shiftWeek(week, 1)).toEqual({
      from: "2026-10-26",
      to: "2026-11-01",
    })
  })
})

describe("datesInRange", () => {
  it("lists every date inclusively", () => {
    const days = datesInRange({ from: "2026-10-19", to: "2026-10-25" })
    expect(days).toHaveLength(7)
    expect(days[0]).toBe("2026-10-19")
    expect(days[6]).toBe("2026-10-25")
  })
})

describe("isCurrentWeek", () => {
  it("compares against the current week", () => {
    expect(isCurrentWeek(currentWeek())).toBe(true)
    expect(isCurrentWeek({ from: "2026-10-12", to: "2026-10-18" })).toBe(false)
  })
})

describe("formatRange", () => {
  it("uses one month when the week stays inside it", () => {
    expect(formatRange({ from: "2026-10-19", to: "2026-10-25" })).toBe(
      "Oct 19 – 25, 2026"
    )
  })

  it("names both months when the week crosses one", () => {
    expect(formatRange({ from: "2026-09-28", to: "2026-10-04" })).toBe(
      "Sep 28 – Oct 4, 2026"
    )
  })
})
