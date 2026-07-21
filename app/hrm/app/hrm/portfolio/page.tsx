"use client"

import * as React from "react"
import { EmployeePortfolioDetails } from "@/features/portfolio/components/employee-portfolio-details"
import { EmployeePortfolioSkeleton } from "@/features/portfolio/components/employee-portfolio-skeleton"
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
          <EmployeePortfolioSkeleton />
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
