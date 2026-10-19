import {
  addDays,
  differenceInCalendarDays,
  format,
  parseISO,
  startOfWeek,
} from "date-fns"

/** Inclusive calendar-date range in `YYYY-MM-DD`, matching the API contract. */
export type DateRange = { from: string; to: string }

const ISO_DAY = "yyyy-MM-dd"

export function toIsoDate(date: Date): string {
  return format(date, ISO_DAY)
}

export function parseIsoDate(value: string): Date {
  return parseISO(value)
}

export function currentWeek(anchor: Date = new Date()): DateRange {
  const start = startOfWeek(anchor, { weekStartsOn: 1 })
  return { from: toIsoDate(start), to: toIsoDate(addDays(start, 6)) }
}

export function rangeDays(range: DateRange): number {
  return (
    differenceInCalendarDays(parseIsoDate(range.to), parseIsoDate(range.from)) +
    1
  )
}

/** Moves a range by whole weeks, keeping its length. */
export function shiftWeek(range: DateRange, weeks: number): DateRange {
  const from = addDays(parseIsoDate(range.from), weeks * 7)
  return {
    from: toIsoDate(from),
    to: toIsoDate(addDays(from, rangeDays(range) - 1)),
  }
}

export function isCurrentWeek(range: DateRange): boolean {
  const week = currentWeek()
  return range.from === week.from && range.to === week.to
}

/** "Oct 12 – 18, 2026", or with both months when the week crosses one. */
export function formatRange(range: DateRange): string {
  const from = parseIsoDate(range.from)
  const to = parseIsoDate(range.to)
  const sameMonth =
    from.getFullYear() === to.getFullYear() && from.getMonth() === to.getMonth()

  if (sameMonth) {
    return `${format(from, "MMM d")} – ${format(to, "d, yyyy")}`
  }
  return `${format(from, "MMM d")} – ${format(to, "MMM d, yyyy")}`
}
