import { apiFetch } from "./client"
import { adminEventsPath, adminMetricsPath, dashboardPath } from "./paths"
import type {
  AdminEventResponse,
  AdminEventsResponse,
  AdminMetricResponse,
  AdminMetricsResponse,
  DashboardResponse,
  EventDto,
  EventInput,
  LoginResponse,
  MetricInput,
  User,
  YearOverYearResponse,
} from "./types"
import type { DateRange } from "@/lib/period"

export function login(input: { email: string; password: string }) {
  return apiFetch<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export function logout() {
  return apiFetch<void>("/api/auth/logout", { method: "POST" })
}

export function getMe() {
  return apiFetch<{ user: User }>("/api/auth/me")
}

export function getDashboard(range: DateRange, compare: boolean) {
  return apiFetch<DashboardResponse>(dashboardPath(range, compare))
}

export function getYearOverYear(range: DateRange) {
  const params = new URLSearchParams({ from: range.from, to: range.to })
  return apiFetch<YearOverYearResponse>(
    `/api/dashboard/year-over-year?${params.toString()}`
  )
}

export function getAdminMetrics(range: DateRange) {
  return apiFetch<AdminMetricsResponse>(adminMetricsPath(range))
}

export function putAdminMetric(date: string, input: MetricInput) {
  return apiFetch<AdminMetricResponse>(`/api/admin/metrics/${date}`, {
    method: "PUT",
    body: JSON.stringify(input),
  })
}

export function deleteAdminMetric(date: string) {
  return apiFetch<void>(`/api/admin/metrics/${date}`, { method: "DELETE" })
}

export function getAdminEvents(range?: DateRange) {
  return apiFetch<AdminEventsResponse>(
    range === undefined ? "/api/admin/events" : adminEventsPath(range)
  )
}

export function createAdminEvent(input: EventInput) {
  return apiFetch<AdminEventResponse>("/api/admin/events", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export function updateAdminEvent(
  id: string,
  input: Partial<EventInput>
): Promise<AdminEventResponse> {
  return apiFetch<AdminEventResponse>(`/api/admin/events/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  })
}

export function deleteAdminEvent(id: string): Promise<void> {
  return apiFetch<void>(`/api/admin/events/${id}`, { method: "DELETE" })
}

export type { EventDto }
