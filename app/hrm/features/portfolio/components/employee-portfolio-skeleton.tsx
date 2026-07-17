import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function EmployeePortfolioSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Loading employee portfolio">
      <span className="sr-only" role="status">Loading employee portfolio</span>

      <Card className="shadow-none">
        <CardContent className="flex flex-col gap-5 p-5 sm:flex-row sm:items-start sm:p-6">
          <Skeleton className="size-20 rounded-full sm:size-24" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-56 max-w-full" />
            <Skeleton className="h-4 w-72 max-w-full" />
            <Skeleton className="h-4 w-96 max-w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-16" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-28" />
          </div>
        </CardContent>
      </Card>

      <Skeleton className="h-12 w-full" />

      <Card className="shadow-none">
        <CardContent className="grid gap-6 p-5 lg:grid-cols-2">
          {[0, 1].map((group) => (
            <div key={group} className="space-y-4">
              <Skeleton className="h-5 w-40" />
              <div className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 6 }, (_, index) => (
                  <div key={index} className="space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-4 w-36 max-w-full" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {Array.from({ length: 3 }, (_, index) => (
        <Card key={index} className="gap-0 overflow-hidden py-0 shadow-none">
          <div className="space-y-2 border-b p-5">
            <Skeleton className="h-5 w-52" />
            <Skeleton className="h-4 w-80 max-w-full" />
          </div>
          <Skeleton className="m-5 h-32 w-auto" />
        </Card>
      ))}
    </div>
  )
}
