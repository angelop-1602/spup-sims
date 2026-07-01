"use client"

import * as React from "react"
import { InteractionStatus } from "@azure/msal-browser"
import { useIsAuthenticated, useMsal } from "@azure/msal-react"
import { useRouter, useSearchParams } from "next/navigation"

import { SignInPage } from "@/components/auth/sign-in-page"
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

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back()
      return
    }

    router.replace("/")
  }

  return (
    <SignInPage
      accountEmail={account?.username}
      accountName={account?.name}
      errorMessage={errorMessage}
      isAuthenticated={isAuthenticated}
      isBusy={isAuthBusy}
      onBack={handleBack}
      onContinue={() => router.replace(returnTo)}
      onSignIn={handleLogin}
      onSignOut={handleLogout}
    />
  )
}

export default function Page() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-svh items-center justify-center bg-[#f7f7f5] text-sm text-zinc-500">
          Loading sign-in...
        </div>
      }
    >
      <LoginContent />
    </React.Suspense>
  )
}
