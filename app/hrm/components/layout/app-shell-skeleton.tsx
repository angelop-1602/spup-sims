import { Skeleton } from "@/components/ui/skeleton"

export function HrmPageSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-busy="true">
      <span className="sr-only">Loading HRM page</span>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-lg border bg-card p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="size-8 rounded-md" />
            </div>
            <Skeleton className="mt-6 h-7 w-20" />
            <Skeleton className="mt-3 h-3 w-32" />
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="mt-2 h-3 w-64 max-w-full" />
          <div className="mt-5 space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full" />
            ))}
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="mt-2 h-3 w-56 max-w-full" />
          <div className="mt-5 space-y-5">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
