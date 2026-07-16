"use client"

import * as React from "react"
import { InteractionStatus } from "@azure/msal-browser"
import { useIsAuthenticated, useMsal } from "@azure/msal-react"
import { ShieldCheck } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"

import { HrmPageSkeleton } from "@/components/layout/app-shell-skeleton"
import { Button } from "@/components/ui/button"
import {
  readCachedHrmAccess,
  type CurrentUser,
  verifyHrmAccess,
} from "@/lib/hrmAccess"

type HrmAuthContextValue = {
  accessError: string | null
  currentUser: CurrentUser | null
  hasDatabaseAccess: boolean | null
  roles: string[]
  permissions: string[]
  hasPermission: (permission: string) => boolean
  isAuthenticated: boolean
  isCheckingAccess: boolean
  signInPath: string
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
  const cachedUser = readCachedHrmAccess(account)

  const [currentUser, setCurrentUser] =
    React.useState<CurrentUser | null>(cachedUser)
  const [hasDatabaseAccess, setHasDatabaseAccess] =
    React.useState<boolean | null>(cachedUser ? true : null)
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
      const cachedAccess = readCachedHrmAccess(account)

      if (cachedAccess) {
        setAccessError(null)
        setCurrentUser(cachedAccess)
        setHasDatabaseAccess(true)
        return
      }

      setAccessError(null)
      setHasDatabaseAccess(null)
      setCurrentUser(null)

      const result = await verifyHrmAccess(instance, account)

      if (result.ok) {
        setCurrentUser(result.user)
        setHasDatabaseAccess(true)
        return
      }

      setHasDatabaseAccess(false)
      setAccessError(result.message)
    }

    void verifyUser()
  }, [account, instance, isAuthenticated, isCheckingSession, router, signInPath])

  const hasPermission = React.useCallback(
    (permission: string) =>
      Boolean(currentUser?.isSuperAdmin || currentUser?.permissions?.includes(permission)),
    [currentUser?.isSuperAdmin, currentUser?.permissions]
  )

  const contextValue = React.useMemo(
    () => ({
      accessError,
      currentUser,
      hasDatabaseAccess,
      roles: currentUser?.roles ?? [],
      permissions: currentUser?.permissions ?? [],
      hasPermission,
      isAuthenticated,
      isCheckingAccess:
        isCheckingSession || (isAuthenticated && hasDatabaseAccess === null),
      signInPath,
    }),
    [
      accessError,
      currentUser,
      hasDatabaseAccess,
      hasPermission,
      isAuthenticated,
      isCheckingSession,
      signInPath,
    ]
  )

  return (
    <HrmAuthContext.Provider value={contextValue}>
      {children}
    </HrmAuthContext.Provider>
  )
}

export function HrmAuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const {
    accessError,
    hasDatabaseAccess,
    isAuthenticated,
    isCheckingAccess,
    signInPath,
  } = useHrmAuth()

  if (isCheckingAccess || !isAuthenticated) {
    return <HrmPageSkeleton />
  }

  if (!hasDatabaseAccess) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-2 text-foreground">
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
      </div>
    )
  }

  return <>{children}</>
}
