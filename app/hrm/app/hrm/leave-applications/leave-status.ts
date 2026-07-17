import type * as React from "react"

import type { Badge } from "@/components/ui/badge"

/** Turn a status enum string (e.g. `PendingDeptApproval`) into a label. */
export function formatStatus(status?: string | null) {
  if (!status) return "Unknown"
  return status
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (char) => char.toUpperCase())
}

/** Pick a badge variant that reads as a status without presuming exact values. */
export function statusVariant(
  status?: string | null,
): React.ComponentProps<typeof Badge>["variant"] {
  const value = (status ?? "").toLowerCase()
  if (value.includes("approv")) return "default"
  if (value.includes("reject")) return "destructive"
  if (value.includes("cancel")) return "destructive"
  if (value.includes("pending") || value.includes("await")) return "secondary"
  return "outline"
}

export function formatDays(value: number | string | undefined | null) {
  if (value === undefined || value === null || value === "") return "0"
  return String(value)
}
