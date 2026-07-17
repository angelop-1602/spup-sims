export class ApiError extends Error {
  status: number
  detail?: unknown

  constructor(message: string, status: number, detail?: unknown) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.detail = detail
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  params?: Record<string, string | number | boolean | undefined | null>
  body?: unknown
}

type Envelope<T> = {
  success: boolean
  message?: string
  data?: T | null
}

function isEnvelope(payload: unknown): payload is Envelope<unknown> {
  return (
    !!payload &&
    typeof payload === "object" &&
    typeof (payload as Record<string, unknown>).success === "boolean" &&
    "data" in payload
  )
}

/**
 * Thin, typed wrapper around `fetch` for the careers (applicant-facing) API.
 * Attaches the bearer token from localStorage, and unwraps the backend's
 * `{ success, message, data }` envelope when present. Some endpoints (e.g.
 * login) return a flat body instead of the envelope, so non-enveloped
 * responses are passed through as-is rather than assumed to be malformed.
 */
export async function request<T>(path: string, { method = "GET", params, body }: RequestOptions = {}): Promise<T> {
  const token = localStorage.getItem("access_token")
  const headers: Record<string, string> = { "Content-Type": "application/json" }
  if (token) headers.Authorization = `Bearer ${token}`

  const url = new URL(path, window.location.origin)
  if (params) {
    const search = new URLSearchParams()
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) continue
      search.set(key, String(value))
    }
    url.search = search.toString()
  }

  const response = await fetch(url.pathname + url.search, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    const message =
      (payload && (payload.detail || payload.title || payload.message)) ||
      `Request failed (${response.status})`
    throw new ApiError(message, response.status, payload)
  }

  if (isEnvelope(payload)) {
    if (payload.success === false) {
      throw new ApiError(payload.message || "Request failed", response.status, payload)
    }
    return (payload.data ?? null) as T
  }

  return payload as T
}
