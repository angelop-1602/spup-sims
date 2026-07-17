"use client"

import { ErrorPage } from "@/components/ui/error-page"

export default function HrmErrorBoundary({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  return (
    <ErrorPage
      status="unknown"
      onRetry={unstable_retry}
      reference={error.digest}
      fullScreen
    />
  )
}
