import { Field, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type ApplicantDateFiltersProps = {
  idPrefix: string
  dateFrom: string
  dateTo: string
  onDateFromChange: (value: string) => void
  onDateToChange: (value: string) => void
  stacked?: boolean
}

export function ApplicantDateFilters({
  idPrefix,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  stacked = false,
}: ApplicantDateFiltersProps) {
  return (
    <FieldSet>
      <FieldLegend className="sr-only">Applied date range</FieldLegend>
      <div className={cn("flex items-end gap-3", stacked && "flex-col items-stretch")}>
        <Field className={cn(!stacked && "w-40")}>
          <FieldLabel htmlFor={`${idPrefix}-date-from`}>Applied from</FieldLabel>
          <Input
            id={`${idPrefix}-date-from`}
            type="date"
            value={dateFrom}
            max={dateTo || undefined}
            onChange={(event) => onDateFromChange(event.target.value)}
          />
        </Field>
        <Field className={cn(!stacked && "w-40")}>
          <FieldLabel htmlFor={`${idPrefix}-date-to`}>Applied to</FieldLabel>
          <Input
            id={`${idPrefix}-date-to`}
            type="date"
            value={dateTo}
            min={dateFrom || undefined}
            onChange={(event) => onDateToChange(event.target.value)}
          />
        </Field>
      </div>
    </FieldSet>
  )
}
