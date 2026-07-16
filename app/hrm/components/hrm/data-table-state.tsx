import { ApiErrorView } from "@/components/ui/api-error-view"
import { cn } from "@/lib/utils"

type DataTableStateProps = {
  loading: boolean
  loadingLabel: string
  error: Error | null
  onRetry?: () => void
  empty: boolean
  emptyState: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function DataTableState({
  loading,
  loadingLabel,
  error,
  onRetry,
  empty,
  emptyState,
  children,
  className,
}: DataTableStateProps) {
  return (
    <div
      className={cn("overflow-hidden rounded-lg border", className)}
      aria-busy={loading}
    >
      {loading ? (
        <span className="sr-only" role="status">
          {loadingLabel}
        </span>
      ) : null}
      {error ? (
        <ApiErrorView
          error={error}
          onRetry={onRetry}
          className="min-h-72 border-0 bg-transparent"
        />
      ) : !loading && empty ? (
        emptyState
      ) : (
        children
      )}
    </div>
  )
}
