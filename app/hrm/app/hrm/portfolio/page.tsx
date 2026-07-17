"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"
import { EmployeePortfolioDetails } from "@/components/hrm/portfolio/employee-portfolio-details"
import { useApiQuery, type components } from "@/lib/api"
import { PermissionGuard } from "@/components/auth/permission-guard"
import { ApiErrorView } from "@/components/ui/api-error-view"

type EmployeeResponse = components["schemas"]["EmployeeResponse"]

export default function EmployeePortfolioPage() {
  const { data: profile, loading, error, refresh } = useApiQuery<EmployeeResponse>(
    "/api/v1/hrms/me/profile",
  )

  return (
    <PermissionGuard requiredPermission="hrms.profile.own.view">
      <div className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading portfolio…
          </div>
        ) : error ? (
          <ApiErrorView error={error} onRetry={refresh} />
        ) : profile ? (
          <EmployeePortfolioDetails profile={profile} onProfileUpdated={refresh} />
        ) : (
          <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
            No portfolio data found.
          </div>
        )}
      </div>
    </PermissionGuard>
  )
}
