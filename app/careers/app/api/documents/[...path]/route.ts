import { NextRequest, NextResponse } from "next/server"

const API_BASE = (process.env.API_BASE_URL ?? "https://sims.spup.space").replace(/\/+$/, "")

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  const storagePath = path.join("/")
  const authHeader = request.headers.get("authorization")

  if (!authHeader) {
    return NextResponse.json({ error: "Authorization header is required" }, { status: 401 })
  }

  try {
    const backendUrl = `${API_BASE}/storage/${storagePath}`

    const res = await fetch(backendUrl, {
      headers: { Authorization: authHeader },
    })

    if (!res.ok) {
      return NextResponse.json(
        { error: `Backend returned ${res.status}` },
        { status: res.status }
      )
    }

    const contentType = res.headers.get("content-type") ?? "application/octet-stream"
    const contentLength = res.headers.get("content-length")

    const headers = new Headers({
      "Content-Type": contentType,
      "Cache-Control": "private, max-age=300",
    })

    if (contentLength) {
      headers.set("Content-Length", contentLength)
    }

    return new NextResponse(res.body, { status: 200, headers })
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch document from backend" },
      { status: 502 }
    )
  }
}
