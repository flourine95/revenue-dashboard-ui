import { redirect } from "next/navigation"
import { AdminScreen } from "@/components/admin/admin-screen"
import { ApiError } from "@/lib/api/error"
import { adminEventsPath, adminMetricsPath } from "@/lib/api/paths"
import { serverApiFetch } from "@/lib/api/server"
import type {
  AdminEventsResponse,
  AdminMetricsResponse,
  EventDto,
  MetricDto,
} from "@/lib/api/types"
import { requireUser } from "@/lib/auth"
import { currentWeek, type DateRange } from "@/lib/period"

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
  const user = await requireUser()
  const range = currentWeek()
  const data = await loadAdminData(range)

  return (
    <AdminScreen
      user={user}
      initialRange={range}
      initialMetrics={data.metrics}
      initialEvents={data.events}
    />
  )
}
