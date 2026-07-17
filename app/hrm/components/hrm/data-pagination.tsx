import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type DataPaginationProps = {
  page: number
  pageSize: number
  totalPages: number
  totalRecords: number
  itemLabel: string
  onPageChange: (page: number) => void
  className?: string
}

export function DataPagination({
  page,
  pageSize,
  totalPages,
  totalRecords,
  itemLabel,
  onPageChange,
  className,
}: DataPaginationProps) {
  const safeTotalPages = Math.max(1, totalPages)
  const safePage = Math.min(Math.max(1, page), safeTotalPages)
  const rangeStart = totalRecords === 0 ? 0 : (safePage - 1) * pageSize + 1
  const rangeEnd = Math.min(safePage * pageSize, totalRecords)

  return (
    <nav
      aria-label={`${itemLabel} pagination`}
      className={cn(
        "flex flex-col items-center justify-between gap-3 sm:flex-row",
        className,
      )}
    >
      <p className="text-sm text-muted-foreground" aria-live="polite">
        Showing {rangeStart}–{rangeEnd} of {totalRecords} {itemLabel}
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(safePage - 1)}
          disabled={safePage <= 1}
          aria-label={`Go to previous ${itemLabel} page`}
        >
          <ChevronLeft aria-hidden="true" />
          Previous
        </Button>
        <span className="min-w-20 text-center text-sm text-muted-foreground">
          {safePage} / {safeTotalPages}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(safePage + 1)}
          disabled={safePage >= safeTotalPages}
          aria-label={`Go to next ${itemLabel} page`}
        >
          Next
          <ChevronRight aria-hidden="true" />
        </Button>
      </div>
    </nav>
  )
}
