"use client"

import * as React from "react"

import { request } from "@/lib/api/client"
import type { ApplicantMePayload } from "@/components/profile/types"

export function logout(router: { push: (href: string) => void }) {
  localStorage.removeItem("access_token")
  router.push("/")
}

export function useAuthStatus() {
  const [status, setStatus] = React.useState<"loading" | "authenticated" | "unauthenticated">("loading")
  const [profile, setProfile] = React.useState<ApplicantMePayload | null>(null)

  React.useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (!token) {
      setStatus("unauthenticated")
      return
    }
    request<ApplicantMePayload>("/api/v1/applicant/me")
      .then((data) => {
        setProfile(data)
        setStatus("authenticated")
      })
      .catch(() => setStatus("unauthenticated"))
  }, [])

  return { status, profile }
}
