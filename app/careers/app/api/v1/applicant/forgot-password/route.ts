import { NextRequest, NextResponse } from "next/server"
import type { components } from "@/lib/api"

const API_BASE = (process.env.API_BASE_URL ?? "https://sims.spup.space").replace(/\/+$/, "")

type ForgotPasswordRequest = components["schemas"]["ForgotPasswordRequest"]

export async function POST(request: NextRequest) {
  const body: ForgotPasswordRequest = await request.json().catch(() => ({ email: "" }))

  try {
    await fetch(`${API_BASE}/api/v1/applicant/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
  } catch {
    // ignore backend/network errors, response below must not reveal whether the email exists
  }

  return NextResponse.json({
    success: true,
    message: "If the email exists, a password reset link has been sent.",
  })
}
