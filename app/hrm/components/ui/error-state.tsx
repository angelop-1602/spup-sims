"use client"

import type { LucideIcon } from "lucide-react"
import { CircleAlert, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type ErrorStateVariant = "compact" | "inline" | "page"

export type ErrorStateProps = {
  title?: string
  description?: string
  icon?: LucideIcon
  onRetry?: () => void
  retryLabel?: string
  actions?: React.ReactNode
  reference?: string
  variant?: ErrorStateVariant
  className?: string
}

export function ErrorState({
  title = "Unable to load this content",
  description = "Please try again. If the problem continues, contact your administrator.",
  icon: Icon = CircleAlert,
  onRetry,
  retryLabel = "Try again",
  actions,
  reference,
  variant = "inline",
  className,
}: ErrorStateProps) {
  const compact = variant === "compact"
  const Heading = variant === "page" ? "h1" : "h2"

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        "flex w-full",
        compact
          ? "items-start gap-3 rounded-md bg-destructive-muted/40 p-3 text-left"
          : "min-h-48 flex-col items-center justify-center rounded-lg border bg-card p-6 text-center",
        variant === "page" && "min-h-[50vh] p-8",
        className,
      )}
    >
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-md border border-destructive-border/60 bg-destructive-muted text-destructive",
          compact ? "size-8" : "mb-4 size-10",
        )}
        aria-hidden="true"
      >
        <Icon className={compact ? "size-4" : "size-5"} />
      </div>

      <div className={cn("min-w-0", compact ? "flex-1" : "max-w-lg")}>
        <Heading className={cn("font-semibold", variant === "page" ? "text-lg" : "text-sm")}>
          {title}
        </Heading>
        <p className={cn("text-muted-foreground", compact ? "mt-1 text-xs" : "mt-2 text-sm")}>
          {description}
        </p>
        {reference ? (
          <p className="mt-2 font-mono text-xs text-muted-foreground">
            Reference: {reference}
          </p>
        ) : null}

        {onRetry || actions ? (
          <div className={cn("flex flex-wrap gap-2", compact ? "mt-3" : "mt-5 justify-center")}>
            {onRetry ? (
              <Button size="sm" variant="outline" onClick={onRetry}>
                <RefreshCw className="size-4" />
                {retryLabel}
              </Button>
            ) : null}
            {actions}
          </div>
        ) : null}
      </div>
    </div>
  )
}
