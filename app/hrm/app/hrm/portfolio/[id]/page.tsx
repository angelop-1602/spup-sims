"use client"

import * as React from "react"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { EmployeePortfolioDetails } from "@/components/hrm/portfolio/employee-portfolio-details"
import { PermissionGuard } from "@/components/auth/permission-guard"
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

  const { data: profile, loading, error, refresh } = useApiQuery<EmployeeResponse>(
    `/api/v1/hrms/employees/${employeeId}`,
  )

  return (
    <PermissionGuard requiredPermission="hrms.employees.view">
    <div className="space-y-6">
      <Link
        href="/hrm/employees"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Employees
      </Link>

      <div>
        <h1 className="text-2xl font-semibold tracking-normal">
          {profile?.fullName ?? "Employee Portfolio"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View the employee profile and employment details.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-lg border bg-card p-10 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading portfolio…
        </div>
      ) : error ? (
        <ApiErrorView error={error} onRetry={refresh} fullScreen />
      ) : profile ? (
        <EmployeePortfolioDetails profile={profile} onProfileUpdated={refresh} readOnly />
      ) : (
        <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
          No portfolio data found.
        </div>
      )}
    </div>
    </PermissionGuard>
  )
}
