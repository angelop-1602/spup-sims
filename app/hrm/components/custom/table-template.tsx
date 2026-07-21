"use client"

import { useId } from "react"
import {
  ArrowDown,
  ArrowUp,
  ChevronFirstIcon,
  ChevronLastIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsUpDown,
  ListFilter,
  Search,
  X,
} from "lucide-react"

import { ApiErrorView } from "@/components/ui/api-error-view"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableSkeletonRows } from "@/components/ui/table-skeleton-rows"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50] as const
const EMPTY_FILTER_OPTIONS: readonly TableTemplateFilterOption[] = []
const EMPTY_SELECTED_VALUES: readonly string[] = []

type PaginationToken = number | "ellipsis-start" | "ellipsis-end"

export type TableTemplateSortDirection = "asc" | "desc"

export type TableTemplateFilterOption = {
  label: string
  value: string
}

export type TableTemplateSearch = {
  value: string
  onChange: (value: string) => void
  onClear?: () => void
  placeholder?: string
  label?: string
  inputId?: string
}

export type TableTemplatePagination = {
  page: number
  pageSize: number
  totalPages: number
  totalRecords: number
  itemLabel: string
  onPageChange: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  pageSizeOptions?: readonly number[]
  summary?: React.ReactNode
}

type TableTemplateProps = {
  label: string
  children: React.ReactNode
  search?: TableTemplateSearch
  filters?: React.ReactNode
  actions?: React.ReactNode
  leadingActions?: React.ReactNode
  activeFilterCount?: number
  hasActiveFilters?: boolean
  onClearFilters?: () => void
  loading?: boolean
  loadingLabel?: string
  loadingSkeleton?: {
    columns: number
    rows?: number
  }
  error?: Error | null
  onRetry?: () => void
  errorState?: React.ReactNode
  empty?: boolean
  emptyState?: React.ReactNode
  pagination?: TableTemplatePagination
  variant?: "contained" | "plain"
  className?: string
  contentClassName?: string
}

export function TableTemplate({
  label,
  children,
  search,
  filters,
  actions,
  leadingActions,
  activeFilterCount = 0,
  hasActiveFilters = false,
  onClearFilters,
  loading = false,
  loadingLabel = "Loading table data",
  loadingSkeleton,
  error,
  onRetry,
  errorState,
  empty = false,
  emptyState,
  pagination,
  variant = "contained",
  className,
  contentClassName,
}: TableTemplateProps) {
  const hasToolbar = Boolean(search || filters || actions || leadingActions)
  const showPagination = Boolean(pagination && !loading && !error)

  let content = children

  if (loading) {
    if (loadingSkeleton) {
      content = (
        <TableTemplateSkeleton
          columns={loadingSkeleton.columns}
          rows={loadingSkeleton.rows}
        />
      )
    }
  } else if (error) {
    content = errorState ?? (
      <ApiErrorView
        error={error}
        onRetry={onRetry}
        variant="inline"
        className="min-h-64 border-0 bg-transparent"
      />
    )
  } else if (empty && emptyState) {
    content = emptyState
  }

  return (
    <section
      aria-label={label}
      aria-busy={loading}
      className={cn(
        "overflow-hidden",
        variant === "contained" && "rounded-lg border bg-card",
        className,
      )}
    >
      {loading ? (
        <span className="sr-only" role="status">
          {loadingLabel}
        </span>
      ) : null}

      {hasToolbar ? (
        <TableTemplateToolbar
          label={`${label} controls`}
          search={search}
          filters={filters}
          actions={actions}
          leadingActions={leadingActions}
          activeFilterCount={activeFilterCount}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={onClearFilters}
          bordered={variant === "contained"}
        />
      ) : null}

      <div
        data-slot="table-template-content"
        className={cn("min-w-0 overflow-x-auto", contentClassName)}
      >
        {content}
      </div>

      {showPagination && pagination ? (
        <footer
          data-slot="table-template-footer"
          className={cn(
            "bg-muted/20 p-3 print:hidden sm:p-4",
            variant === "contained" && "border-t",
          )}
        >
          <TableTemplatePaginationControls {...pagination} />
        </footer>
      ) : null}
    </section>
  )
}

export function TableTemplateSkeleton({
  columns,
  rows = 8,
}: {
  columns: number
  rows?: number
}) {
  const safeColumns = Math.max(1, columns)
  const safeRows = Math.max(1, rows)

  return (
    <Table aria-hidden="true">
      <TableHeader>
        <TableRow className="bg-muted/50 hover:bg-muted/50">
          {Array.from({ length: safeColumns }, (_, columnIndex) => (
            <TableHead key={columnIndex}>
              <Skeleton
                className={cn(
                  "h-4",
                  columnIndex % 3 === 0
                    ? "w-28"
                    : columnIndex % 3 === 1
                      ? "w-20"
                      : "w-16",
                )}
              />
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableSkeletonRows columns={safeColumns} rows={safeRows} />
      </TableBody>
    </Table>
  )
}

function TableTemplateToolbar({
  label,
  search,
  filters,
  actions,
  leadingActions,
  activeFilterCount,
  hasActiveFilters,
  onClearFilters,
  bordered,
}: {
  label: string
  search?: TableTemplateSearch
  filters?: React.ReactNode
  actions?: React.ReactNode
  leadingActions?: React.ReactNode
  activeFilterCount: number
  hasActiveFilters: boolean
  onClearFilters?: () => void
  bordered: boolean
}) {
  return (
    <div
      role="group"
      aria-label={label}
      data-slot="table-template-command"
      className={cn("p-3 sm:p-4", bordered && "border-b")}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          {search ? <TableTemplateSearchInput search={search} /> : null}

          {filters ? (
            <Sheet>
              <SheetTrigger asChild>
                <Button type="button" variant="outline">
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
                    Narrow the records shown in this table.
                  </SheetDescription>
                </SheetHeader>
                <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-6 pb-6">
                  {filters}
                </div>
                <SheetFooter className="border-t">
                  {hasActiveFilters && onClearFilters ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClearFilters}
                    >
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

          {leadingActions}

          {hasActiveFilters && onClearFilters ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="hidden lg:inline-flex"
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
    </div>
  )
}

function TableTemplateSearchInput({ search }: { search: TableTemplateSearch }) {
  const generatedId = useId()
  const id = search.inputId ?? generatedId
  const label = search.label ?? "Search table"

  return (
    <div className="relative min-w-0 flex-1 sm:max-w-sm">
      <Label htmlFor={id} className="sr-only">
        {label}
      </Label>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        id={id}
        type="search"
        value={search.value}
        onChange={(event) => search.onChange(event.target.value)}
        placeholder={search.placeholder ?? "Search records"}
        className="pr-9 pl-9"
        autoComplete="off"
      />
      {search.value ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="absolute top-1/2 right-2 -translate-y-1/2"
          onClick={() => {
            if (search.onClear) search.onClear()
            else search.onChange("")
          }}
          aria-label={`Clear ${label.toLowerCase()}`}
        >
          <X aria-hidden="true" />
        </Button>
      ) : null}
    </div>
  )
}

export function TableTemplateColumnHeader({
  label,
  sortDirection = null,
  onSortChange,
  ascendingLabel = "Sort ascending",
  descendingLabel = "Sort descending",
  filterOptions = EMPTY_FILTER_OPTIONS,
  selectedValues = EMPTY_SELECTED_VALUES,
  onSelectedValuesChange,
  className,
}: {
  label: string
  sortDirection?: TableTemplateSortDirection | null
  onSortChange?: (direction: TableTemplateSortDirection | null) => void
  ascendingLabel?: string
  descendingLabel?: string
  filterOptions?: readonly TableTemplateFilterOption[]
  selectedValues?: readonly string[]
  onSelectedValuesChange?: (values: string[]) => void
  className?: string
}) {
  const canSort = Boolean(onSortChange)
  const canFilter = filterOptions.length > 0 && Boolean(onSelectedValuesChange)
  const selectedValueSet = new Set(selectedValues)
  const activeFilterCount = selectedValues.length

  if (!canSort && !canFilter) {
    return <span className={className}>{label}</span>
  }

  function toggleFilter(value: string, checked: boolean) {
    if (!onSelectedValuesChange) return

    const nextValues = checked
      ? [...selectedValues, value]
      : selectedValues.filter((selectedValue) => selectedValue !== value)

    onSelectedValuesChange(Array.from(new Set(nextValues)))
  }

  const SortIcon =
    sortDirection === "asc"
      ? ArrowUp
      : sortDirection === "desc"
        ? ArrowDown
        : ChevronsUpDown

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="xs"
          className={cn("-ml-2 h-8 px-2 font-medium", className)}
          aria-label={`${label} column options${activeFilterCount > 0 ? `, ${activeFilterCount} filters active` : ""}`}
        >
          <span>{label}</span>
          {canSort ? (
            <SortIcon
              aria-hidden="true"
              className={cn(
                "text-muted-foreground",
                sortDirection && "text-foreground",
              )}
            />
          ) : (
            <ListFilter aria-hidden="true" className="text-muted-foreground" />
          )}
          {activeFilterCount > 0 ? (
            <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[0.625rem] text-primary-foreground">
              {activeFilterCount}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {canSort ? (
          <>
            <DropdownMenuLabel>Sort</DropdownMenuLabel>
            <DropdownMenuItem onSelect={() => onSortChange?.("asc")}>
              <ArrowUp aria-hidden="true" />
              {ascendingLabel}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onSortChange?.("desc")}>
              <ArrowDown aria-hidden="true" />
              {descendingLabel}
            </DropdownMenuItem>
            {sortDirection ? (
              <DropdownMenuItem onSelect={() => onSortChange?.(null)}>
                <X aria-hidden="true" />
                Clear sorting
              </DropdownMenuItem>
            ) : null}
          </>
        ) : null}

        {canSort && canFilter ? <DropdownMenuSeparator /> : null}

        {canFilter ? (
          <>
            <DropdownMenuLabel>Filter {label.toLowerCase()}</DropdownMenuLabel>
            {filterOptions.map((option) => (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={selectedValueSet.has(option.value)}
                onCheckedChange={(checked) =>
                  toggleFilter(option.value, checked === true)
                }
                onSelect={(event) => event.preventDefault()}
              >
                {option.label}
              </DropdownMenuCheckboxItem>
            ))}
            {activeFilterCount > 0 ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => onSelectedValuesChange?.([])}
                >
                  <X aria-hidden="true" />
                  Clear {label.toLowerCase()} filters
                </DropdownMenuItem>
              </>
            ) : null}
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function TableTemplatePaginationControls({
  page: requestedPage,
  pageSize,
  totalPages: requestedTotalPages,
  totalRecords,
  itemLabel,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  summary,
}: TableTemplatePagination) {
  const id = useId()
  const totalPages = Math.max(1, requestedTotalPages)
  const page = Math.min(Math.max(1, requestedPage), totalPages)
  const rangeStart = totalRecords === 0 ? 0 : (page - 1) * pageSize + 1
  const rangeEnd = Math.min(page * pageSize, totalRecords)
  const paginationTokens = getPaginationTokens(page, totalPages)
  const hiddenPageCount = Math.max(0, totalPages - 5)

  function paginationLinkProps(nextPage: number) {
    const safePage = Math.min(Math.max(1, nextPage), totalPages)

    return {
      href: `#page-${safePage}`,
      onClick: (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault()
        onPageChange(safePage)
      },
    }
  }

  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-4 max-sm:justify-center">
      {onPageSizeChange ? (
        <div className="flex shrink-0 items-center gap-3">
          <Label htmlFor={id}>Rows per page</Label>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => {
              const nextPageSize = Number(value)
              if (!Number.isFinite(nextPageSize) || nextPageSize <= 0) return
              onPageSizeChange(nextPageSize)
              onPageChange(1)
            }}
          >
            <SelectTrigger id={id} className="w-fit whitespace-nowrap">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {pageSizeOptions.map((pageSizeOption) => (
                  <SelectItem
                    key={pageSizeOption}
                    value={String(pageSizeOption)}
                  >
                    {pageSizeOption}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      ) : null}

      <div className="flex grow items-center justify-end whitespace-nowrap max-sm:justify-center">
        {summary ?? (
          <p className="text-sm text-muted-foreground" aria-live="polite">
            Showing <span className="text-foreground">{rangeStart}</span> to{" "}
            <span className="text-foreground">{rangeEnd}</span> of{" "}
            <span className="text-foreground">{totalRecords}</span> {itemLabel}
          </p>
        )}
      </div>

      <Pagination className="w-fit max-sm:mx-0">
        <PaginationContent>
          <PaginationItem>
            <PaginationLink
              {...paginationLinkProps(1)}
              aria-label="Go to first page"
              aria-disabled={page <= 1}
              tabIndex={page <= 1 ? -1 : undefined}
              size="icon"
              className={cn(
                "rounded-full",
                page <= 1 && "pointer-events-none opacity-50",
              )}
            >
              <ChevronFirstIcon aria-hidden="true" className="size-4" />
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink
              {...paginationLinkProps(page - 1)}
              aria-label="Go to previous page"
              aria-disabled={page <= 1}
              tabIndex={page <= 1 ? -1 : undefined}
              size="icon"
              className={cn(
                "rounded-full",
                page <= 1 && "pointer-events-none opacity-50",
              )}
            >
              <ChevronLeftIcon aria-hidden="true" className="size-4" />
            </PaginationLink>
          </PaginationItem>

          {paginationTokens.map((token) =>
            typeof token === "number" ? (
              <PaginationItem key={token} className="max-sm:hidden">
                <PaginationLink
                  {...paginationLinkProps(token)}
                  isActive={token === page}
                  aria-label={`Go to page ${token}`}
                  className="rounded-full"
                >
                  {token}
                </PaginationLink>
              </PaginationItem>
            ) : (
              <PaginationItem key={token} className="max-sm:hidden">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span
                        tabIndex={0}
                        aria-label={`${hiddenPageCount} additional pages`}
                      >
                        <PaginationEllipsis />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{hiddenPageCount} additional pages</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </PaginationItem>
            ),
          )}

          <PaginationItem>
            <PaginationLink
              {...paginationLinkProps(page + 1)}
              aria-label="Go to next page"
              aria-disabled={page >= totalPages}
              tabIndex={page >= totalPages ? -1 : undefined}
              size="icon"
              className={cn(
                "rounded-full",
                page >= totalPages && "pointer-events-none opacity-50",
              )}
            >
              <ChevronRightIcon aria-hidden="true" className="size-4" />
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink
              {...paginationLinkProps(totalPages)}
              aria-label="Go to last page"
              aria-disabled={page >= totalPages}
              tabIndex={page >= totalPages ? -1 : undefined}
              size="icon"
              className={cn(
                "rounded-full",
                page >= totalPages && "pointer-events-none opacity-50",
              )}
            >
              <ChevronLastIcon aria-hidden="true" className="size-4" />
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}

function getPaginationTokens(
  page: number,
  totalPages: number,
): PaginationToken[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  if (page <= 3) {
    return [1, 2, 3, 4, "ellipsis-end", totalPages]
  }

  if (page >= totalPages - 2) {
    return [
      1,
      "ellipsis-start",
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ]
  }

  return [
    1,
    "ellipsis-start",
    page - 1,
    page,
    page + 1,
    "ellipsis-end",
    totalPages,
  ]
}
