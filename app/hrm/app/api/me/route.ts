import { type NextRequest, NextResponse } from "next/server"

const API_BASE = process.env.SIMS_API_BASE_URL ?? "https://sims.spup.space/api/v1"

/**
 * Proxies GET /api/me → backend GET /api/v1/me
 *
 * The backend returns ApiResponseOfCurrentUserResponse which contains:
 *   { data: { userId, profileId, email, azureId, roles, permissions, isSuperAdmin } }
 *
 * hrmAccess.ts calls this route then parses the payload via unwrapUserPayload()
 * which handles both `{ data: { data: ... } }` and `{ data: ... }` shapes.
 */
export async function GET(request: NextRequest) {
  const token = request.headers.get("authorization")

  if (!token) {
    return NextResponse.json(
      { error: "Missing authorization header" },
      { status: 401 }
    )
  }

  const base = API_BASE.replace(/\/+$/, "")

  try {
    const response = await fetch(`${base}/me`, {
      method: "GET",
      headers: {
        Authorization: token,
        Accept: "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      return new NextResponse(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: { "Content-Type": "application/json" },
      })
    }

    const data = await response.json()

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error("Failed to proxy /api/me", error)
    return NextResponse.json({ error: "API request failed" }, { status: 502 })
  }
}
