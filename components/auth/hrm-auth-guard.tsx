"use client"

import * as React from "react"
import { InteractionStatus } from "@azure/msal-browser"
import { useIsAuthenticated, useMsal } from "@azure/msal-react"
import { ShieldCheck } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"

const API_SCOPES =
  process.env.NEXT_PUBLIC_API_SCOPES?.split(/[\s,]+/).filter(Boolean) ?? [
    "User.Read",
  ]

type CurrentUser = {
  userId: number | string | null
  profileId: number | string | null
  email: string | null
  azureId: string | null
  roles: string[]
  permissions: string[]
  isSuperAdmin: boolean
}

type HrmAuthContextValue = {
  currentUser: CurrentUser | null
  roles: string[]
  permissions: string[]
  hasPermission: (permission: string) => boolean
}

const HrmAuthContext = React.createContext<HrmAuthContextValue | null>(null)

export function useHrmAuth() {
  const context = React.useContext(HrmAuthContext)

  if (!context) {
    throw new Error("useHrmAuth must be used within HrmAuthGuard")
  }

  return context
}

export function HrmAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { accounts, inProgress, instance } = useMsal()
  const isAuthenticated = useIsAuthenticated()
  const account = accounts[0]
  const isCheckingSession = inProgress !== InteractionStatus.None
  const signInPath = `/login?returnTo=${encodeURIComponent(pathname)}`

  const [currentUser, setCurrentUser] =
    React.useState<CurrentUser | null>(null)
  const [hasDatabaseAccess, setHasDatabaseAccess] =
    React.useState<boolean | null>(null)
  const [accessError, setAccessError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (account && !instance.getActiveAccount()) {
      instance.setActiveAccount(account)
    }
  }, [account, instance])

  React.useEffect(() => {
    if (!isCheckingSession && !isAuthenticated) {
      router.replace(signInPath)
      return
    }

    if (!isAuthenticated || !account) {
      return
    }

    const verifyUser = async () => {
      setAccessError(null)
      setHasDatabaseAccess(null)
      setCurrentUser(null)

      try {
        const result = await instance.acquireTokenSilent({
          scopes: API_SCOPES,
          account,
        })

        const response = await fetch("/api/me", {
          headers: {
            Authorization: `Bearer ${result.accessToken}`,
            Accept: "application/json",
          },
          cache: "no-store",
        })

        if (!response.ok) {
          setHasDatabaseAccess(false)
          setAccessError(
            response.status === 404
              ? "Your account is not registered in the HRM database."
              : "You do not have permission to access this application."
          )
          return
        }

        const payload = await response.json()
        const user =
          payload?.data?.data ?? payload?.data ?? payload ?? null

        if (
          !user ||
          !Array.isArray(user.roles) ||
          !Array.isArray(user.permissions)
        ) {
          setHasDatabaseAccess(false)
          setAccessError("Unable to verify your HRM access.")
          return
        }

        setCurrentUser(user)
        setHasDatabaseAccess(true)
      } catch (error) {
        setHasDatabaseAccess(false)
        setAccessError(
          error instanceof Error
            ? error.message
            : "Unable to verify your HRM access."
        )
      }
    }

    void verifyUser()
  }, [account, instance, isAuthenticated, isCheckingSession, router, signInPath])

  const hasPermission = React.useCallback(
    (permission: string) =>
      Boolean(currentUser?.permissions?.includes(permission)),
    [currentUser?.permissions]
  )

  const contextValue = React.useMemo(
    () => ({
      currentUser,
      roles: currentUser?.roles ?? [],
      permissions: currentUser?.permissions ?? [],
      hasPermission,
    }),
    [currentUser, hasPermission]
  )

  if (isCheckingSession || (isAuthenticated && hasDatabaseAccess === null)) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <p className="text-sm text-muted-foreground">Checking access…</p>
        </div>
      </main>
    )
  }

  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
        <div className="w-full max-w-md rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-700/10 text-emerald-700">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Authentication required</h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Sign in with Microsoft to access the HRM workspace.
              </p>
            </div>
          </div>

          <Button className="mt-6 w-full" onClick={() => router.push(signInPath)}>
            Go to sign in
          </Button>
        </div>
      </main>
    )
  }

  if (!hasDatabaseAccess) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
        <div className="w-full max-w-md rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Access denied</h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {accessError ??
                  "Your Azure account is not registered in the HRM database."}
              </p>
            </div>
          </div>

          <Button
            className="mt-6 w-full"
            variant="outline"
            onClick={() => router.replace(signInPath)}
          >
            Return to sign in
          </Button>
        </div>
      </main>
    )
  }

  return (
    <HrmAuthContext.Provider value={contextValue}>
      {children}
    </HrmAuthContext.Provider>
  )
}
