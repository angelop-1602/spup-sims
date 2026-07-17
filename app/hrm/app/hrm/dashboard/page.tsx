"use client"

import * as React from "react"
import Link from "next/link"
import {
  CalendarClock,
  FileCheck2,
  UserRoundPlus,
  Users,
} from "lucide-react"

import { PermissionGuard } from "@/components/auth/permission-guard"
import { TableTemplate } from "@/components/custom/table-template"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ErrorState } from "@/components/ui/error-state"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableSkeletonRows } from "@/components/ui/table-skeleton-rows"
import { useApiQuery } from "@/lib/api"

const pipeline = [
  { stage: "Application Screening", count: 18, status: "In progress" },
  { stage: "Initial Interview", count: 8, status: "Scheduled" },
  { stage: "Final Interview", count: 6, status: "For panel" },
  { stage: "Job Offer", count: 4, status: "Pending" },
] as const

const actions = [
  { item: "Review faculty appointment papers", owner: "HR Officer", due: "Today" },
  { item: "Prepare onboarding checklist", owner: "Recruitment", due: "Tomorrow" },
  { item: "Validate employee portfolio updates", owner: "Records", due: "Friday" },
] as const

type DashboardMetricResponse = {
  key: string
  label: string
  value: number | string
  unit: string | null
  description: string | null
}

type DashboardBreakdownResponse = {
  key: string
  label: string
  items: { label: string; value: number | string }[]
}

export default function HrmDashboardPage() {
  const {
    data: totalMetric,
    loading: loadingTotal,
    error: totalError,
    refresh: refreshTotal,
  } = useApiQuery<DashboardMetricResponse>("/api/v1/hrms/dashboard/cards/employees-total")

  const {
    data: activeMetric,
    loading: loadingActive,
    error: activeError,
    refresh: refreshActive,
  } = useApiQuery<DashboardMetricResponse>("/api/v1/hrms/dashboard/cards/employees-active")

  const {
    data: recruitmentMetric,
    loading: loadingRecruitment,
    error: recruitmentError,
    refresh: refreshRecruitment,
  } = useApiQuery<DashboardBreakdownResponse>("/api/v1/hrms/dashboard/cards/recruitment-status")

  const {
    data: docsExpiringMetric,
    loading: loadingDocs,
    error: docsError,
    refresh: refreshDocs,
  } = useApiQuery<DashboardMetricResponse>("/api/v1/hrms/dashboard/cards/documents-expiring")

  const {
    data: byDepartmentMetric,
    loading: loadingByDept,
    error: departmentError,
    refresh: refreshDepartments,
  } = useApiQuery<DashboardBreakdownResponse>("/api/v1/hrms/dashboard/cards/employees-by-department")

  const openApplicants = React.useMemo(() => {
    if (!recruitmentMetric) return undefined

    const total = (recruitmentMetric.items ?? []).reduce(
      (sum, item) => sum + Number(item.value ?? 0),
      0,
    )
    return String(total)
  }, [recruitmentMetric])

  const summaryCards = [
    {
      label: "Total Employees",
      value: String(totalMetric?.value ?? "—"),
      detail: totalMetric?.description ?? "All personnel records",
      icon: Users,
      loading: loadingTotal,
      error: totalError,
      onRetry: refreshTotal,
    },
    {
      label: "Active Employees",
      value: String(activeMetric?.value ?? "—"),
      detail: activeMetric?.description ?? "Currently active staff",
      icon: UserRoundPlus,
      loading: loadingActive,
      error: activeError,
      onRetry: refreshActive,
    },
    {
      label: "Open Applicants",
      value: String(openApplicants ?? "—"),
      detail: "Across all recruitment stages",
      icon: FileCheck2,
      loading: loadingRecruitment,
      error: recruitmentError,
      onRetry: refreshRecruitment,
    },
    {
      label: "Documents Expiring",
      value: String(docsExpiringMetric?.value ?? "—"),
      detail: docsExpiringMetric?.description ?? "Within the next 30 days",
      icon: CalendarClock,
      loading: loadingDocs,
      error: docsError,
      onRetry: refreshDocs,
    },
  ]

  const departmentRows = React.useMemo(() => {
    if (!byDepartmentMetric) return []

    return (byDepartmentMetric.items ?? []).slice(0, 4).map((item) => ({
      name: item.label,
      headcount: Number(item.value ?? 0),
    }))
  }, [byDepartmentMetric])

  return (
    <PermissionGuard requiredPermission="hrms.dashboard.view">
      <div>
        <h1 className="sr-only">HRM Dashboard</h1>
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => {
              const Icon = card.icon

              return (
                <Card key={card.label} className="rounded-lg" aria-busy={card.loading}>
                  <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
                    <div>
                      <CardDescription>{card.label}</CardDescription>
                      <CardTitle className="mt-2 min-h-9 text-3xl font-semibold">
                        {card.loading ? (
                          <Skeleton className="h-9 w-20" />
                        ) : card.error ? (
                          <span className="text-base text-muted-foreground">Unavailable</span>
                        ) : (
                          card.value
                        )}
                      </CardTitle>
                    </div>
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    {card.loading ? (
                      <>
                        <span className="sr-only" role="status">
                          Loading {card.label}
                        </span>
                        <Skeleton className="h-4 w-36 max-w-full" />
                      </>
                    ) : card.error ? (
                      <ErrorState
                        variant="compact"
                        title={`Unable to load ${card.label.toLowerCase()}`}
                        description="This metric is temporarily unavailable."
                        onRetry={card.onRetry}
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">{card.detail}</p>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
            <Card className="rounded-lg">
              <CardHeader>
                <CardTitle>Applicant Pipeline</CardTitle>
                <CardDescription>
                  Current applicant counts by recruitment stage.
                </CardDescription>
              </CardHeader>
              <CardContent aria-busy={loadingRecruitment}>
                {loadingRecruitment ? (
                  <span className="sr-only" role="status">
                    Loading applicant pipeline
                  </span>
                ) : null}
                <TableTemplate label="Applicant pipeline table" variant="plain">
                  <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Stage</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Count</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingRecruitment ? (
                      <TableSkeletonRows columns={3} rows={4} />
                    ) : recruitmentError ? (
                      <TableRow>
                        <TableCell colSpan={3} className="p-0">
                          <ErrorState
                            className="min-h-40 border-0 bg-transparent"
                            title="Unable to load the applicant pipeline"
                            description="Recruitment data is temporarily unavailable."
                            onRetry={refreshRecruitment}
                          />
                        </TableCell>
                      </TableRow>
                    ) : recruitmentMetric?.items && recruitmentMetric.items.length > 0 ? (
                      recruitmentMetric.items.map((item) => (
                        <TableRow key={item.label}>
                          <TableCell className="font-medium">{item.label}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="rounded-md">
                              Active
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">{item.value}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      pipeline.map((item) => (
                        <TableRow key={item.stage}>
                          <TableCell className="font-medium">{item.stage}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="rounded-md">
                              {item.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">{item.count}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                  </Table>
                </TableTemplate>
              </CardContent>
              <CardFooter className="border-t">
                <Button asChild variant="outline" size="sm">
                  <Link href="/hrm/applicants">Open applicants</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="rounded-lg">
              <CardHeader>
                <CardTitle>Workforce by Department</CardTitle>
                <CardDescription>
                  Employee headcount per department.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5" aria-busy={loadingByDept}>
                {loadingByDept ? (
                  <>
                    <span className="sr-only" role="status">
                      Loading workforce by department
                    </span>
                    {Array.from({ length: 4 }, (_, index) => (
                      <div key={index} className="space-y-2" aria-hidden="true">
                        <Skeleton className="h-4 w-36" />
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-2 w-full" />
                      </div>
                    ))}
                  </>
                ) : departmentError ? (
                  <ErrorState
                    className="min-h-52 border-0 bg-transparent"
                    title="Unable to load workforce distribution"
                    description="Department headcount data is temporarily unavailable."
                    onRetry={refreshDepartments}
                  />
                ) : departmentRows.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No department data available.</p>
                ) : (
                  departmentRows.map((department) => (
                    <div key={department.name} className="space-y-2">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-medium">{department.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {department.headcount} employee{department.headcount !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <Progress
                        value={
                          totalMetric?.value && Number(totalMetric.value) > 0
                            ? Math.round((department.headcount / Number(totalMetric.value)) * 100)
                            : 0
                        }
                      />
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>Pending HR Actions</CardTitle>
              <CardDescription>
                Tasks that need attention from the HR office.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-3">
                {actions.map((action) => (
                  <div
                    key={action.item}
                    className="rounded-lg border bg-background p-4"
                  >
                    <p className="font-medium leading-6">{action.item}</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {action.owner}
                    </p>
                    <Badge variant="outline" className="mt-4 rounded-md">
                      Due {action.due}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PermissionGuard>
  )
}
