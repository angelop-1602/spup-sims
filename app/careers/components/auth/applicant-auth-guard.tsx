"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"

import { Skeleton } from "@/components/ui/skeleton"

export function ApplicantAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [hasToken, setHasToken] = React.useState(false)

  React.useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (!token) {
      router.replace(`/login?returnTo=${encodeURIComponent(pathname)}`)
      return
    }
    setHasToken(true)
  }, [pathname, router])

  if (!hasToken) {
    return <Skeleton className="h-64 w-full" />
  }

  return <>{children}</>
}
