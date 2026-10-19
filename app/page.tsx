import { redirect } from "next/navigation"
import { DashboardScreen } from "@/components/dashboard/dashboard-screen"
import { ApiError } from "@/lib/api/error"
import { dashboardPath } from "@/lib/api/paths"
import { serverApiFetch } from "@/lib/api/server"
import type { DashboardResponse } from "@/lib/api/types"
import { requireUser } from "@/lib/auth"
import { currentWeek } from "@/lib/period"

export default async function Page() {
  const user = await requireUser()
  const range = currentWeek()

  let data: DashboardResponse
  try {
    data = await serverApiFetch<DashboardResponse>(dashboardPath(range, true))
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/login")
    throw error
  }

  return <DashboardScreen user={user} initialRange={range} initialData={data} />
}
