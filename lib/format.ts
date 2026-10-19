const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

const integer = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
})

export function formatCurrency(value: number): string {
  return currency.format(value)
}

export function formatNumber(value: number): string {
  return integer.format(value)
}

/** `+6.6%` / `-2.1%`; null when there is no baseline to compare against. */
export function formatDelta(delta: number | null): string | null {
  if (delta === null) return null
  const sign = delta > 0 ? "+" : ""
  return `${sign}${delta.toFixed(1)}%`
}

/** Chart axis ticks: 750 → "0.75k", 1500 → "1.5k", 0 → "0k". */
export function formatAxisTick(value: number): string {
  if (value === 0) return "0k"
  if (value < 1000) return String(value)
  const thousands = value / 1000
  return `${Number.isInteger(thousands) ? thousands : thousands.toFixed(2)}k`
}

export function formatDayLabel(date: string): string {
  const parsed = new Date(`${date}T00:00:00`)
  return parsed.toLocaleDateString("en-US", { weekday: "short" })
}
