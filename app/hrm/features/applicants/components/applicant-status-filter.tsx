"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { FieldLegend, FieldSet } from "@/components/ui/field"
import { Label } from "@/components/ui/label"

type ApplicantStatusFilterProps = {
  idPrefix: string
  statuses: readonly string[]
  selectedStatuses: readonly string[]
  onSelectedStatusesChange: (statuses: string[]) => void
}

export function ApplicantStatusFilter({
  idPrefix,
  statuses,
  selectedStatuses,
  onSelectedStatusesChange,
}: ApplicantStatusFilterProps) {
  const selectedStatusSet = new Set(selectedStatuses)

  function toggleStatus(status: string, checked: boolean) {
    const nextStatuses = checked
      ? [...selectedStatuses, status]
      : selectedStatuses.filter(
          (selectedStatus) => selectedStatus !== status,
        )

    onSelectedStatusesChange(Array.from(new Set(nextStatuses)))
  }

  return (
    <FieldSet>
      <FieldLegend>Status</FieldLegend>
      <div className="grid gap-3 sm:grid-cols-2">
        {statuses.map((status) => {
          const id = `${idPrefix}-${status.toLowerCase().replaceAll(" ", "-")}`

          return (
            <div key={status} className="flex items-center gap-3">
              <Checkbox
                id={id}
                checked={selectedStatusSet.has(status)}
                onCheckedChange={(checked) =>
                  toggleStatus(status, checked === true)
                }
              />
              <Label htmlFor={id} className="font-normal">
                {status}
              </Label>
            </div>
          )
        })}
      </div>
    </FieldSet>
  )
}
