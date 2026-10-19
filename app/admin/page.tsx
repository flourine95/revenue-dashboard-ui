import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { AdminScreen } from "@/components/admin/admin-screen"
import { ApiError } from "@/lib/api/error"
import { adminEventsPath, adminMetricsPath } from "@/lib/api/paths"
import { getSessionUser, serverApiFetch } from "@/lib/api/server"
import type {
  AdminEventsResponse,
  AdminMetricsResponse,
  EventDto,
  MetricDto,
} from "@/lib/api/types"
import { currentWeek, type DateRange } from "@/lib/period"

export const metadata: Metadata = {
  title: "Manage data",
}

async function loadAdminData(
  range: DateRange
): Promise<{ metrics: MetricDto[]; events: EventDto[] }> {
  try {
    const [metricsResponse, eventsResponse] = await Promise.all([
      serverApiFetch<AdminMetricsResponse>(adminMetricsPath(range)),
      serverApiFetch<AdminEventsResponse>(adminEventsPath(range)),
    ])

    return {
      metrics: metricsResponse.metrics,
      events: eventsResponse.events,
    }
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/login")
    throw error
  }
}

export default async function AdminPage() {
  const range = currentWeek()

  const [user, data] = await Promise.all([
    getSessionUser(),
    loadAdminData(range),
  ])

  if (user === null) redirect("/login")

  return (
    <AdminScreen
      user={user}
      initialRange={range}
      initialMetrics={data.metrics}
      initialEvents={data.events}
    />
  )
}
