import { StatusBadge, type StatusTone } from "@/components/hrm/status-badge"

const APPLICANT_STATUS_TONES: Record<string, StatusTone> = {
  Submitted: "neutral",
  Pending: "warning",
  Interview: "info",
  Hired: "success",
  Rejected: "danger",
}

export function ApplicantStatusBadge({ status }: { status: string }) {
  return (
    <StatusBadge tone={APPLICANT_STATUS_TONES[status] ?? "neutral"}>
      {status}
    </StatusBadge>
  )
}
