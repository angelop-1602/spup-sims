"use client"

import * as React from "react"
import { EmployeePortfolioDetails } from "@/components/hrm/portfolio/employee-portfolio-details"
import { useApiQuery, type components } from "@/lib/api"

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal">
          Employee Portfolio
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
            View your authenticated portfolio profile and employment details.
        </p>
      </div>

      {loading ? (
        <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
          Loading portfolio...
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6 text-sm text-destructive">
          {error.message}
        </div>
      ) : profile ? (
        <EmployeePortfolioDetails profile={profile} onProfileUpdated={refresh} />
      ) : (
        <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
          No portfolio data found.
        </div>
      )}
    </div>
  )
}