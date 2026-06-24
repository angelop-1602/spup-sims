"use client"

import * as React from "react"
import { InteractionStatus } from "@azure/msal-browser"
import { useIsAuthenticated, useMsal } from "@azure/msal-react"
import { ShieldCheck } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"

export function HrmAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { accounts, inProgress, instance } = useMsal()
  const isAuthenticated = useIsAuthenticated()
  const account = accounts[0]
  const isCheckingSession = inProgress !== InteractionStatus.None
  const signInPath = `/login?returnTo=${encodeURIComponent(pathname)}`

  React.useEffect(() => {
    if (account && !instance.getActiveAccount()) {
      instance.setActiveAccount(account)
    }
  }, [account, instance])

  React.useEffect(() => {
    if (!isCheckingSession && !isAuthenticated) {
      router.replace(signInPath)
    }
  }, [isAuthenticated, isCheckingSession, router, signInPath])

  if (isAuthenticated) {
    return <>{children}</>
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <div className="w-full max-w-md rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-700/10 text-emerald-700">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">
              {isCheckingSession ? "Checking access" : "Authentication required"}
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {isCheckingSession
                ? "Please wait while we verify your Microsoft session."
                : "Sign in with Microsoft to access the HRM workspace."}
            </p>
          </div>
        </div>

        {!isCheckingSession ? (
          <Button className="mt-6 w-full" onClick={() => router.push(signInPath)}>
            Go to sign in
          </Button>
        ) : null}
      </div>
    </main>
  )
}
