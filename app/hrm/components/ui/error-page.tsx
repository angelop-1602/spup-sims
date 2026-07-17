"use client"

import {
  ArrowLeft,
  RefreshCw,
} from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  getErrorConfig,
  getErrorLabel,
  type ErrorAction,
  type ErrorIdentifier,
} from "@/components/ui/error-catalog"
import {
  ErrorState,
  type ErrorStateVariant,
} from "@/components/ui/error-state"

export type {
  ApplicationErrorCode,
  ErrorCode,
  ErrorIdentifier,
} from "@/components/ui/error-catalog"

export type ErrorPageProps = {
  status: ErrorIdentifier
  description?: string
  onRetry?: () => void
  className?: string
  variant?: ErrorStateVariant
  reference?: string
  /** Compatibility option. Errors remain inside the shell instead of creating a fixed overlay. */
  fullScreen?: boolean
}

export function ErrorPage({
  status,
  description,
  onRetry,
  className,
  variant,
  reference,
  fullScreen = false,
}: ErrorPageProps) {
  const router = useRouter()
  const config = getErrorConfig(status)
  const label = getErrorLabel(status)

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back()
      return
    }

    router.push("/hrm/dashboard")
  }

  const handleHome = () => {
    router.push("/hrm/dashboard")
  }

  const handleRetry = () => {
    if (onRetry) {
      onRetry()
      return
    }

    router.refresh()
  }

  const renderAction = (
    action: ErrorAction | undefined,
    variant: "default" | "outline" = "default",
  ) => {
    if (!action) return null

    if (action === "retry") {
      return (
        <Button variant={variant} size="sm" onClick={handleRetry}>
          <RefreshCw className="size-4" />
          Try again
        </Button>
      )
    }

    if (action === "back") {
      return (
        <Button variant={variant} size="sm" onClick={handleBack}>
          <ArrowLeft className="size-4" />
          Go back
        </Button>
      )
    }

    return (
      <Button variant={variant} size="sm" onClick={handleHome}>
        Dashboard
      </Button>
    )
  }

  return (
    <ErrorState
      title={`${label} — ${config.title}`}
      description={description ?? config.description}
      icon={config.icon}
      variant={variant ?? (fullScreen ? "page" : "inline")}
      className={className}
      reference={reference}
      actions={
        <>
          {renderAction(config.primaryAction)}
          {renderAction(config.secondaryAction, "outline")}
        </>
      }
    />
  )
}
