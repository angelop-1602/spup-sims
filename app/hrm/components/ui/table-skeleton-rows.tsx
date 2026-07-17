import { Skeleton } from "@/components/ui/skeleton"
import { TableCell, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

type TableSkeletonRowsProps = {
  columns: number
  rows?: number
  cellClassName?: string
}

const CELL_WIDTHS = ["w-28", "w-40", "w-20", "w-24", "w-32", "w-16"] as const

export function TableSkeletonRows({
  columns,
  rows = 6,
  cellClassName,
}: TableSkeletonRowsProps) {
  return Array.from({ length: rows }, (_, rowIndex) => (
    <TableRow key={rowIndex} aria-hidden="true">
      {Array.from({ length: columns }, (__, columnIndex) => (
        <TableCell key={columnIndex} className={cn("h-11", cellClassName)}>
          <Skeleton
            className={cn(
              "h-4 max-w-full",
              CELL_WIDTHS[columnIndex % CELL_WIDTHS.length],
              columnIndex === columns - 1 && "ml-auto",
            )}
          />
        </TableCell>
      ))}
    </TableRow>
  ))
}
