"use client"

import * as React from "react"
import { InteractionStatus } from "@azure/msal-browser"
import { useIsAuthenticated, useMsal } from "@azure/msal-react"
import { useRouter, useSearchParams } from "next/navigation"

import {
  SignInPage,
  SignInPageSkeleton,
} from "@/components/auth/sign-in-page"
import { loginRequest } from "@/lib/authConfig"
import { clearCachedHrmAccess, verifyHrmAccess } from "@/lib/hrmAccess"

const LOGIN_PENDING_KEY = "spup:sims:login-pending"
const LOGIN_PENDING_EVENT = "spup:login-pending-change"

function getPendingLoginSnapshot() {
  return window.sessionStorage.getItem(LOGIN_PENDING_KEY) === "1"
}

function getPendingLoginServerSnapshot() {
  return false
}

function subscribeToPendingLogin(onStoreChange: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.storageArea === window.sessionStorage && event.key === LOGIN_PENDING_KEY) {
      onStoreChange()
    }
  }

  window.addEventListener("storage", handleStorage)
  window.addEventListener(LOGIN_PENDING_EVENT, onStoreChange)

  return () => {
    window.removeEventListener("storage", handleStorage)
    window.removeEventListener(LOGIN_PENDING_EVENT, onStoreChange)
  }
}

function notifyPendingLoginChanged() {
  window.dispatchEvent(new Event(LOGIN_PENDING_EVENT))
}

function writePendingLogin() {
  window.sessionStorage.setItem(LOGIN_PENDING_KEY, "1")
  notifyPendingLoginChanged()
}

function clearPendingLogin() {
  window.sessionStorage.removeItem(LOGIN_PENDING_KEY)
  notifyPendingLoginChanged()
}

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
  const hasPendingLogin = React.useSyncExternalStore(
    subscribeToPendingLogin,
    getPendingLoginSnapshot,
    getPendingLoginServerSnapshot
  )
  const [isSigningIn, setIsSigningIn] = React.useState(false)
  const [isVerifying, setIsVerifying] = React.useState(false)
  const account = accounts[0]
  const returnTo = getSafeReturnPath(searchParams.get("returnTo"))
  const isAuthBusy = inProgress !== InteractionStatus.None

  React.useEffect(() => {
    if (account && !instance.getActiveAccount()) {
      instance.setActiveAccount(account)
    }
  }, [account, instance])

  React.useEffect(() => {
    if (isAuthBusy || !isAuthenticated || !account) {
      return
    }

    let isCurrent = true

    const verifyAndContinue = async () => {
      setErrorMessage("")
      setIsSigningIn(false)
      setIsVerifying(true)

      const result = await verifyHrmAccess(instance, account)

      if (!isCurrent) {
        return
      }

      if (result.ok) {
        clearPendingLogin()
        router.replace(returnTo)
        return
      }

      clearPendingLogin()
      clearCachedHrmAccess()
      setIsVerifying(false)
      setErrorMessage(result.message)
    }

    void verifyAndContinue()

    return () => {
      isCurrent = false
    }
  }, [account, instance, isAuthBusy, isAuthenticated, returnTo, router])

  const handleLogin = async () => {
    setErrorMessage("")
    writePendingLogin()
    setIsSigningIn(true)
    setIsVerifying(false)

    try {
      await instance.loginRedirect({
        ...loginRequest,
        redirectStartPage: window.location.href,
      })
    } catch (error) {
      console.error(error)
      clearPendingLogin()
      setIsSigningIn(false)
      setErrorMessage(getAuthErrorMessage(error))
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
      busyLabel={
        isVerifying || (hasPendingLogin && isAuthenticated)
          ? "Verifying access..."
          : "Preparing sign-in..."
      }
      errorMessage={errorMessage}
      isBusy={
        isSigningIn ||
        isVerifying ||
        (hasPendingLogin && (isAuthBusy || isAuthenticated))
      }
      onBack={handleBack}
      onSignIn={handleLogin}
    />
  )
}

export default function Page() {
  return (
    <React.Suspense
      fallback={<SignInPageSkeleton />}
    >
      <LoginContent />
    </React.Suspense>
  )
}
