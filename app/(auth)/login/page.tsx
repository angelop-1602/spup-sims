"use client"

import * as React from "react"
import { InteractionStatus } from "@azure/msal-browser"
import { useIsAuthenticated, useMsal } from "@azure/msal-react"
import { ArrowRight, LogOut, ShieldCheck } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { loginRequest } from "@/lib/authConfig"
import { signOutCurrentAccount } from "@/lib/msalLogout"

function getSafeReturnPath(returnTo: string | null) {
  if (!returnTo || !returnTo.startsWith("/") || returnTo.startsWith("//")) {
    return "/hrm/dashboard"
  }

  if (returnTo === "/login") {
    return "/hrm/dashboard"
  }

  return returnTo
}

function getAuthErrorMessage(error: unknown) {
  const authError = error as {
    errorCode?: string
    message?: string
    subError?: string
  }

  if (
    authError.errorCode === "timed_out" ||
    authError.subError === "redirect_bridge_timeout"
  ) {
    return "Sign-in timed out while waiting for Microsoft. Check that the Azure redirect URI matches the app configuration."
  }

  if (authError.errorCode) {
    return `Sign-in failed (${authError.errorCode}). Please try again.`
  }

  return authError.message ?? "Sign-in failed. Please try again."
}

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { accounts, inProgress, instance } = useMsal()
  const isAuthenticated = useIsAuthenticated()
  const [errorMessage, setErrorMessage] = React.useState("")
  const account = accounts[0]
  const returnTo = getSafeReturnPath(searchParams.get("returnTo"))
  const isAuthBusy = inProgress !== InteractionStatus.None

  React.useEffect(() => {
    if (account && !instance.getActiveAccount()) {
      instance.setActiveAccount(account)
    }
  }, [account, instance])

  React.useEffect(() => {
    if (!isAuthBusy && isAuthenticated) {
      router.replace(returnTo)
    }
  }, [isAuthBusy, isAuthenticated, returnTo, router])

  const handleLogin = async () => {
    setErrorMessage("")

    try {
      await instance.loginRedirect({
        ...loginRequest,
        redirectStartPage: window.location.href,
      })
    } catch (error) {
      console.error(error)
      setErrorMessage(getAuthErrorMessage(error))
    }
  }

  const handleLogout = async () => {
    setErrorMessage("")

    try {
      await signOutCurrentAccount(instance, account)
    } catch (error) {
      console.error(error)
      setErrorMessage("Sign-out failed. Please refresh the page.")
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-4 py-10 text-foreground">
      <div className="w-full max-w-4xl rounded-lg border border-border bg-card p-8 shadow-sm">
        <div className="mb-8 space-y-3">
          <div className="flex size-11 items-center justify-center rounded-lg bg-emerald-700/10 text-emerald-700">
            <ShieldCheck className="size-5" />
          </div>
          <p className="text-sm font-semibold uppercase tracking-normal text-muted-foreground">
            Authentication
          </p>
          <h1 className="text-3xl font-semibold sm:text-4xl">
            Sign in with Microsoft
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            Use your Microsoft account to access protected HRM functionality.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
          <div className="rounded-lg bg-muted p-6">
            <h2 className="text-lg font-semibold">Protected HRM access</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              This app uses the existing MSAL configuration to authenticate
              users with Microsoft before they enter the HRM workspace.
            </p>

            <ul className="mt-5 space-y-2 text-sm text-foreground/80">
              <li>Redirect sign-in with Microsoft Entra ID</li>
              <li>Requested scopes come from the app auth configuration</li>
              <li>Session cached in browser session storage</li>
            </ul>
          </div>

          <div className="rounded-lg border border-border bg-background p-6">
            {isAuthenticated ? (
              <div className="space-y-5">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Signed in as
                  </p>
                  <p className="mt-2 text-lg font-semibold">
                    {account?.name ?? account?.username}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {account?.username}
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    className="justify-between"
                    onClick={() => router.replace(returnTo)}
                  >
                    Continue to HRM
                    <ArrowRight className="size-4" />
                  </Button>
                  <Button variant="outline" onClick={handleLogout}>
                    <LogOut className="size-4" />
                    Sign out
                  </Button>
                </div>

                {errorMessage ? (
                  <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {errorMessage}
                  </p>
                ) : null}
              </div>
            ) : (
              <div className="space-y-5">
                <p className="text-sm text-muted-foreground">
                  Authenticate to enter the HRM dashboard and access protected
                  functionality.
                </p>
                <Button disabled={isAuthBusy} onClick={handleLogin}>
                  {isAuthBusy ? "Preparing sign-in..." : "Sign in with Microsoft"}
                </Button>

                {errorMessage ? (
                  <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {errorMessage}
                  </p>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-svh items-center justify-center bg-background text-sm text-muted-foreground">
          Loading sign-in...
        </div>
      }
    >
      <LoginContent />
    </React.Suspense>
  )
}
