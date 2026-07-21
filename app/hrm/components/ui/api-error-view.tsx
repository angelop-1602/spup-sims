"use client"

import { ErrorPage } from "@/components/ui/error-page"
import type { ApplicationErrorCode } from "@/components/ui/error-catalog"
import type { ErrorStateVariant } from "@/components/ui/error-state"

type ApiErrorViewProps = {
  error: Error
  onRetry?: () => void
  fullScreen?: boolean
  variant?: ErrorStateVariant
  className?: string
}

function getApplicationErrorCode(error: Error): ApplicationErrorCode {
  const errorText = `${error.name} ${error.message}`.toLowerCase()

  if (errorText.includes("offline")) return "offline"
  if (errorText.includes("timeout") || errorText.includes("abort")) return "timeout"
  if (errorText.includes("network") || errorText.includes("failed to fetch")) return "network"

  return "unknown"
}

export function ApiErrorView({
  error,
  onRetry,
  fullScreen = false,
  variant,
  className,
}: ApiErrorViewProps) {
  const status = (error as { status?: number }).status

  return (
    <ErrorPage
      status={typeof status === "number" ? status : getApplicationErrorCode(error)}
      onRetry={onRetry}
      variant={variant}
      fullScreen={fullScreen}
      className={className}
    />
  )
}
