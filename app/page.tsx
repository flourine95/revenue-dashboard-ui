import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { DashboardScreen } from "@/components/dashboard/dashboard-screen"
import { dashboardPath } from "@/lib/api/paths"
import { getSessionUser, serverApiFetch } from "@/lib/api/server"
import type { DashboardResponse } from "@/lib/api/types"
import { currentWeek } from "@/lib/period"

export const metadata: Metadata = {
  title: "Overview",
}

export default async function Page() {
  const range = currentWeek()

  // Fetch the session and the dashboard together; awaiting the session first
  // would add a full round-trip before the dashboard request starts.
  const [user, data] = await Promise.all([
    getSessionUser(),
    serverApiFetch<DashboardResponse>(dashboardPath(range, true)),
  ])

  if (user === null) redirect("/login")

  return <DashboardScreen user={user} initialRange={range} initialData={data} />
}
