import { Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type DataSearchInputProps = Omit<
  React.ComponentProps<typeof Input>,
  "type"
> & {
  clearLabel?: string
  onClear?: () => void
}

export function DataSearchInput({
  className,
  clearLabel = "Clear search",
  onClear,
  value,
  ...props
}: DataSearchInputProps) {
  const hasValue = typeof value === "string" && value.length > 0

  return (
    <div className="relative">
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        type="search"
        className={cn("pr-10 pl-9", className)}
        value={value}
        {...props}
      />
      {hasValue && onClear ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute top-1/2 right-0.5 -translate-y-1/2 active:translate-y-[-50%]!"
          onClick={onClear}
          aria-label={clearLabel}
        >
          <X aria-hidden="true" />
        </Button>
      ) : null}
    </div>
  )
}
