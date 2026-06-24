import { type NextRequest, NextResponse } from "next/server"

const API_BASE = process.env.SIMS_API_BASE_URL ?? "https://sims.spup.space/api/v1"
const HOP_BY_HOP_HEADERS = [
  "connection",
  "content-encoding",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]

type ApiRouteContext = {
  params: Promise<{ path: string[] }>
}

function getTargetUrl(path: string[], request: NextRequest) {
  const baseUrl = new URL(API_BASE)
  const basePath = baseUrl.pathname.replace(/\/$/, "")
  const targetPath = path.map((segment) => encodeURIComponent(segment)).join("/")

  baseUrl.pathname = `${basePath}/${targetPath}`
  baseUrl.search = request.nextUrl.search

  return baseUrl
}

function isPublicLoginEndpoint(path: string[], method: string) {
  if (method !== "POST") {
    return false
  }

  const normalizedPath = path.join("/").toLowerCase()

  return normalizedPath === "login" || normalizedPath === "auth/login"
}

function getForwardedHeaders(request: NextRequest, token: string | null) {
  const headers = new Headers()
  const accept = request.headers.get("accept")
  const contentType = request.headers.get("content-type")

  if (accept) {
    headers.set("accept", accept)
  }

  if (contentType) {
    headers.set("content-type", contentType)
  }

  if (token) {
    headers.set("authorization", token)
  }

  return headers
}

function getResponseHeaders(response: Response) {
  const headers = new Headers(response.headers)

  for (const header of HOP_BY_HOP_HEADERS) {
    headers.delete(header)
  }

  return headers
}

async function getRequestBody(request: NextRequest) {
  if (request.method === "GET" || request.method === "HEAD") {
    return undefined
  }

  return request.arrayBuffer()
}

async function proxyRequest(request: NextRequest, context: ApiRouteContext) {
  const { path } = await context.params
  const token = request.headers.get("authorization")

  if (!token && !isPublicLoginEndpoint(path, request.method)) {
    return NextResponse.json(
      { error: "Missing authorization header" },
      { status: 401 }
    )
  }

  try {
    const response = await fetch(getTargetUrl(path, request), {
      body: await getRequestBody(request),
      cache: "no-store",
      headers: getForwardedHeaders(request, token),
      method: request.method,
      redirect: "manual",
    })

    return new Response(response.body, {
      headers: getResponseHeaders(response),
      status: response.status,
      statusText: response.statusText,
    })
  } catch (error) {
    console.error("API proxy request failed", error)

    return NextResponse.json({ error: "API request failed" }, { status: 502 })
  }
}

export const GET = proxyRequest
export const POST = proxyRequest
export const PUT = proxyRequest
export const PATCH = proxyRequest
export const DELETE = proxyRequest
export const HEAD = proxyRequest
