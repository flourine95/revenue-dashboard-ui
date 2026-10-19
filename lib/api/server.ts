import { cookies } from "next/headers"
import { ApiError, apiErrorFrom } from "./error"
import type { User } from "./types"

const baseUrl = (process.env.API_URL ?? "http://localhost:4000").replace(
  /\/$/,
  ""
)

async function request(path: string): Promise<Response> {
  const cookieStore = await cookies()

  try {
    return await fetch(`${baseUrl}${path}`, {
      headers: { cookie: cookieStore.toString() },
      cache: "no-store",
    })
  } catch {
    throw new ApiError(
      503,
      "API_UNAVAILABLE",
      `Cannot reach the API at ${baseUrl}. Is it running?`
    )
  }
}

/**
 * Server-side API request. The incoming browser cookie is forwarded so the API
 * can resolve the session while rendering on the server. Cookies ignore ports,
 * so the cookie set by `localhost:4000` is visible here on `localhost:3000`.
 */
export async function serverApiFetch<T>(path: string): Promise<T> {
  const response = await request(path)
  if (!response.ok) throw await apiErrorFrom(response)
  return (await response.json()) as T
}

/** Reads the signed-in user, or null when there is no valid session. */
export async function getSessionUser(): Promise<User | null> {
  const response = await request("/api/auth/me")
  if (response.status === 401) return null
  if (!response.ok) throw await apiErrorFrom(response)

  const body = (await response.json()) as { user: User }
  return body.user
}
