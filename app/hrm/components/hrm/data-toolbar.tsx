import { ListFilter } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

type DataToolbarProps = {
  label: string
  search?: React.ReactNode
  filters?: React.ReactNode
  mobileFilters?: React.ReactNode
  actions?: React.ReactNode
  activeFilterCount?: number
  hasActiveFilters?: boolean
  onClearFilters?: () => void
  className?: string
}

export function DataToolbar({
  label,
  search,
  filters,
  mobileFilters,
  actions,
  activeFilterCount = 0,
  hasActiveFilters = false,
  onClearFilters,
  className,
}: DataToolbarProps) {
  return (
    <section
      aria-label={label}
      className={cn("rounded-lg border bg-card p-3 sm:p-4", className)}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-3 md:flex-row md:flex-wrap md:items-end">
          {search ? <div className="min-w-0 flex-1 lg:max-w-sm">{search}</div> : null}

          {filters ? (
            <div className="hidden items-end gap-3 md:flex">{filters}</div>
          ) : null}

          {mobileFilters ? (
            <Sheet>
              <SheetTrigger asChild>
                <Button type="button" variant="outline" className="md:hidden">
                  <ListFilter aria-hidden="true" />
                  Filters
                  {activeFilterCount > 0 ? (
                    <span className="flex size-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                      {activeFilterCount}
                    </span>
                  ) : null}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[min(90vw,24rem)]">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                  <SheetDescription>
                    Narrow the records shown in this list.
                  </SheetDescription>
                </SheetHeader>
                <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 pb-6">
                  {mobileFilters}
                </div>
                <SheetFooter className="border-t">
                  {hasActiveFilters && onClearFilters ? (
                    <Button type="button" variant="outline" onClick={onClearFilters}>
                      Clear all filters
                    </Button>
                  ) : null}
                  <SheetClose asChild>
                    <Button type="button">Show results</Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          ) : null}

          {hasActiveFilters && onClearFilters ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="hidden md:inline-flex"
              onClick={onClearFilters}
            >
              Clear filters
            </Button>
          ) : null}
        </div>

        {actions ? (
          <div className="flex shrink-0 items-center gap-2 [&>[data-slot=button]]:flex-1 sm:[&>[data-slot=button]]:flex-none">
            {actions}
          </div>
        ) : null}
      </div>
    </section>
  )
}
