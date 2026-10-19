type ApiErrorEnvelope = {
  error?: { code?: string; message?: string; details?: unknown }
}

/** Thrown for every non-2xx API response. */
export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly details: unknown

  constructor(
    status: number,
    code: string,
    message: string,
    details?: unknown
  ) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.code = code
    this.details = details
  }
}

/** Reads the `{ error: { code, message, details } }` envelope of a response. */
export async function apiErrorFrom(response: Response): Promise<ApiError> {
  let body: ApiErrorEnvelope | null = null
  try {
    body = (await response.json()) as ApiErrorEnvelope
  } catch {
    // Non-JSON body (proxy error, empty payload) — fall back to the status.
  }

  const { code, message, details } = body?.error ?? {}
  return new ApiError(
    response.status,
    code ?? "UNKNOWN_ERROR",
    message ?? response.statusText,
    details
  )
}
