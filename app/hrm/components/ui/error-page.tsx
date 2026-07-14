"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { ArrowLeft, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export type ErrorCode = 401 | 403 | 404 | 500

interface ErrorConfig {
  image: string
  title: string
  description: string
  primaryAction?: "back" | "retry" | "home"
  secondaryAction?: "back" | "home"
}

const ERROR_CONFIG: Record<ErrorCode, ErrorConfig> = {
  401: {
    image: "/img/Error 401.jpg",
    title: "Unauthorized",
    description:
      "You need to be logged in to access this page. Please sign in and try again.",
    primaryAction: "home",
    secondaryAction: "back",
  },
  403: {
    image: "/img/Error 403.jpg",
    title: "Access Forbidden",
    description:
      "You don't have permission to view this resource. Contact your administrator if you think this is a mistake.",
    primaryAction: "home",
    secondaryAction: "back",
  },
  404: {
    image: "/img/Error 404.jpg",
    title: "Page Not Found",
    description:
      "The page you're looking for doesn't exist or may have been moved.",
    primaryAction: "back",
    secondaryAction: "home",
  },
  500: {
    image: "/img/Error 500.jpg",
    title: "Server Error",
    description:
      "Something went wrong on our end. Please try again in a moment.",
    primaryAction: "retry",
    secondaryAction: "back",
  },
}

interface ErrorPageProps {
  /** HTTP status code — 401, 403, 404, or 500. */
  status: ErrorCode
  /** Override the default description text. */
  description?: string
  /** Called when the user clicks the retry button (500 only by default). */
  onRetry?: () => void
  /** Extra Tailwind classes for the root element. */
  className?: string
  /**
   * When true the error page is rendered as a fixed full-screen overlay,
   * bypassing any parent layout (sidebar, topbar, max-width wrappers, etc.).
   */
  fullScreen?: boolean
}

export function ErrorPage({
  status,
  description,
  onRetry,
  className,
  fullScreen = false,
}: ErrorPageProps) {
  const router = useRouter()
  const config = ERROR_CONFIG[status]

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push("/hrm/dashboard")
    }
  }

  const handleHome = () => {
    router.push("/hrm/dashboard")
  }

  const renderAction = (action: "back" | "retry" | "home" | undefined, variant: "default" | "outline" = "default") => {
    if (!action) return null

    if (action === "retry") {
      return (
        <Button variant={variant} onClick={onRetry ?? handleBack}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Try again
        </Button>
      )
    }

    if (action === "back") {
      return (
        <Button variant={variant} onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go back
        </Button>
      )
    }

    if (action === "home") {
      return (
        <Button variant={variant} onClick={handleHome}>
          Dashboard
        </Button>
      )
    }

    return null
  }

  return (
    <div
      className={[
        fullScreen
          ? "fixed inset-0 z-50 bg-background"
          : "min-h-[60vh] px-4 py-16",
        "flex flex-col items-center justify-center text-center",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={[
        "relative select-none",
        fullScreen ? "w-full h-full" : "h-64 w-80 sm:h-72 sm:w-96",
      ].join(" ")}>
        <Image
          src={config.image}
          alt={`Error ${status} illustration`}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        {/* Action buttons overlaid at the bottom of the image */}
        <div className="absolute bottom-8 left-0 right-0 z-10 flex flex-wrap items-center justify-center gap-3">
          {renderAction(config.primaryAction, "default")}
          {renderAction(config.secondaryAction, "outline")}
        </div>
      </div>
    </div>
  )
}

/**
 * Inline error state for use inside a page when an API call returns an HTTP
 * error. Maps the `ApiError.status` to the matching error illustration.
 *
 * @example
 * if (error) return <ApiErrorView error={error} onRetry={refresh} />
 * if (error) return <ApiErrorView error={error} onRetry={refresh} fullScreen />
 */
export function ApiErrorView({
  error,
  onRetry,
  fullScreen,
}: {
  error: Error
  onRetry?: () => void
  /** When true, renders as a fixed full-screen overlay bypassing the layout. */
  fullScreen?: boolean
}) {
  // Dynamically import ApiError at call-time to avoid a hard coupling.
  const status = (error as { status?: number }).status

  if (status === 401 || status === 403 || status === 404 || status === 500) {
    return <ErrorPage status={status} onRetry={onRetry} fullScreen={fullScreen} />
  }

  // Generic fallback for non-HTTP errors (network failures, etc.)
  return (
    <ErrorPage
      status={500}
      description={error.message || "An unexpected error occurred. Please try again."}
      onRetry={onRetry}
      fullScreen={fullScreen}
    />
  )
}
