import LeaveSettingsClient from "./leave-settings-client"
import { PermissionGuard } from "@/components/auth/permission-guard"
import type { components } from "@/lib/api"

type LeaveType = components["schemas"]["LeaveTypeResponse"]

type LeaveTypesApiResponse = {
  success: boolean
  message?: string
  data: LeaveType[] | null
}

async function fetchLeaveTypes(): Promise<LeaveType[]> {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")

  try {
    const response = await fetch(
      `${baseUrl}/api/v1/hrms/leave-types`,
      {
        cache: "no-store",
      },
    )

    if (!response.ok) {
      return []
    }

    const payload = (await response.json()) as LeaveTypesApiResponse
    return payload.data ?? []
  } catch {
    return []
  }
}

export default async function LeaveSettingsPage() {
  const initialLeaveTypes = await fetchLeaveTypes()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal">Leave Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure leave types, employee allocations, and remaining balances for the year.
          </p>
        </div>
      </div>

      <LeaveSettingsClient initialLeaveTypes={initialLeaveTypes} />
    </div>
  )
}