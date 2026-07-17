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
  const canEditProfile = hasPermission("hrms.employees.create")

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
