"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"

import { Skeleton } from "@/components/ui/skeleton"
import { ApiError, request } from "@/lib/api/client"
import type { ApplicantMePayload } from "@/components/profile/types"

type ApplicantProfileContextValue = {
  profile: ApplicantMePayload | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

const ApplicantProfileContext = React.createContext<ApplicantProfileContextValue | null>(null)

export function useApplicantProfile() {
  const context = React.useContext(ApplicantProfileContext)
  if (!context) {
    throw new Error("useApplicantProfile must be used within an ApplicantAuthGuard")
  }
  return context
}

export function ApplicantAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [hasToken, setHasToken] = React.useState(false)
  const [profile, setProfile] = React.useState<ApplicantMePayload | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchProfile = React.useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await request<ApplicantMePayload>("/api/v1/applicant/me")
      setProfile(data)
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.replace(`/login?returnTo=${encodeURIComponent(pathname)}`)
        return
      }
      setError(err instanceof Error ? err.message : "Failed to load your profile.")
    } finally {
      setIsLoading(false)
    }
  }, [pathname, router])

  React.useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (!token) {
      router.replace(`/login?returnTo=${encodeURIComponent(pathname)}`)
      return
    }
    setHasToken(true)
    void fetchProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, router])

  if (!hasToken) {
    return <Skeleton className="h-64 w-full" />
  }

  return (
    <ApplicantProfileContext.Provider value={{ profile, isLoading, error, refetch: fetchProfile }}>
      {children}
    </ApplicantProfileContext.Provider>
  )
}
