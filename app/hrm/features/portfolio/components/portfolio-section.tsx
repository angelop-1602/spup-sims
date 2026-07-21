import type { ReactNode } from "react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export function PortfolioSection({
  id,
  title,
  description,
  recordCount,
  action,
  isEmpty = false,
  emptyMessage,
  children,
  className,
}: {
  id: string
  title: string
  description?: string
  recordCount?: number
  action?: ReactNode
  isEmpty?: boolean
  emptyMessage?: string
  children: ReactNode
  className?: string
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={cn(
        "scroll-mt-36 print:scroll-mt-0",
        isEmpty && "print:hidden",
        className,
      )}
    >
      <Card className="gap-0 overflow-hidden py-0 shadow-none print:border print:break-inside-auto">
        <CardHeader className="gap-x-4 border-b px-4 py-4 sm:px-5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 id={`${id}-heading`} className="text-base font-semibold">
                {title}
              </h2>
              {recordCount == null ? (
                <Skeleton className="h-5 w-16 print:hidden" />
              ) : (
                <Badge variant="secondary">
                  {recordCount} {recordCount === 1 ? "record" : "records"}
                </Badge>
              )}
            </div>
            {description ? (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {action ? (
            <CardAction className="shrink-0 print:hidden">{action}</CardAction>
          ) : null}
        </CardHeader>

        <CardContent className="p-0">
          {isEmpty ? (
            <EmptyState
              title="No records"
              description={emptyMessage}
              className="min-h-40 rounded-none border-0"
            />
          ) : (
            children
          )}
        </CardContent>
      </Card>
    </section>
  )
}
