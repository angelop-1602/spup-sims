"use client"

import * as React from "react"
import { PermissionGuard } from "@/components/auth/permission-guard"
import { useHrmAuth } from "@/components/auth/hrm-auth-guard"
import { EmployeePortfolioDetails } from "@/features/portfolio/components/employee-portfolio-details"
import { EmployeePortfolioSkeleton } from "@/features/portfolio/components/employee-portfolio-skeleton"
import { useApiQuery, type components } from "@/lib/api"
import { ApiErrorView } from "@/components/ui/api-error-view"

type EmployeeResponse = components["schemas"]["EmployeeResponse"]

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default function ViewEmployeePortfolioPage({ params }: PageProps) {
  const unwrappedParams = React.use(params)
  const employeeId = unwrappedParams.id
  const { hasPermission } = useHrmAuth()
  // Editing another employee's personal/profile details (name, gender, contact info, etc.)
  // requires core.profiles.update — HR roles without it can view but not edit this section;
  // employment details are managed from the employees list instead.
  const canEditProfile = hasPermission("core.profiles.update")
  // Employment details (department, position, employee type, date hired) are editable
  // by any HR role that can edit employees at all — from this profile view, not just
  // the employees list table.
  const canEditEmployment = hasPermission("hrms.employees.update")

  const { data: profile, loading, error, refresh } = useApiQuery<EmployeeResponse>(
    `/api/v1/hrms/employees/${employeeId}`,
  )

  return (
    <PermissionGuard requiredPermission="hrms.employees.view">
      <div className="space-y-6">
        {loading ? (
          <EmployeePortfolioSkeleton />
        ) : error ? (
          <ApiErrorView error={error} onRetry={refresh} fullScreen />
        ) : profile ? (
          <EmployeePortfolioDetails
            profile={profile}
            onProfileUpdated={refresh}
            readOnly
            canEditProfile={canEditProfile}
            canUploadPicture={false}
            selfService={false}
            canEditEmployment={canEditEmployment}
          />
        ) : (
          <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
            No portfolio data found.
          </div>
        )}
      </div>
    </PermissionGuard>
  )
}
