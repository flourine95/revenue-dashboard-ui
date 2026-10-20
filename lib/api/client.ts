import { ApiError, apiErrorFrom } from "./error"

const baseUrl = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
).replace(/\/$/, "")

/**
 * Browser-side API request. The API session cookie is httpOnly and scoped to
 * the API origin, so it is only sent when `credentials: "include"` is set.
 */
export async function apiFetch<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  let response: Response

  try {
    response = await fetch(`${baseUrl}${path}`, {
      credentials: "include",
      cache: "no-store",
      ...init,
      headers: {
        ...(init.body === undefined
          ? {}
          : { "Content-Type": "application/json" }),
        ...init.headers,
      },
    })
  } catch {
    // fetch only rejects for network or CORS failures, never for HTTP errors.
    throw new ApiError(
      503,
      "API_UNAVAILABLE",
      `Cannot reach the API at ${baseUrl}. Is it running?`
    )
  }

  if (!response.ok) throw await apiErrorFrom(response)
  if (response.status === 204) return undefined as T

  return (await response.json()) as T
}
