import LeaveSettingsClient from "./leave-settings-client"

export default function LeaveSettingsPage() {
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

      <LeaveSettingsClient />
    </div>
  )
}
