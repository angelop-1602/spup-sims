"use client"

import * as React from "react"
import Link from "next/link"
import { useApiQuery } from "@/lib/api"
import { PermissionGuard } from "@/components/auth/permission-guard"
import {
  ArrowUpRight,
  CalendarClock,
  FileCheck2,
  UserRoundPlus,
  Users,
} from "lucide-react"

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
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ApiErrorView } from "@/components/ui/error-page"

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
  const { data: totalMetric, loading: loadingTotal, error: totalError, refresh: refreshDashboard } =
    useApiQuery<DashboardMetricResponse>("/api/v1/hrms/dashboard/cards/employees-total")

  const { data: activeMetric, loading: loadingActive } =
    useApiQuery<DashboardMetricResponse>("/api/v1/hrms/dashboard/cards/employees-active")

  const { data: recruitmentMetric, loading: loadingRecruitment } =
    useApiQuery<DashboardBreakdownResponse>("/api/v1/hrms/dashboard/cards/recruitment-status")

  const { data: docsExpiringMetric, loading: loadingDocs } =
    useApiQuery<DashboardMetricResponse>("/api/v1/hrms/dashboard/cards/documents-expiring")

  const { data: byDepartmentMetric, loading: loadingByDept } =
    useApiQuery<DashboardBreakdownResponse>("/api/v1/hrms/dashboard/cards/employees-by-department")

  const fmt = (loading: boolean, value: number | string | undefined) =>
    loading ? "..." : String(value ?? "—")

  // Sum up all recruitment statuses for "Open Applicants"
  const openApplicants = React.useMemo(() => {
    if (loadingRecruitment || !recruitmentMetric) return "..."
    const total = (recruitmentMetric.items ?? []).reduce(
      (sum, item) => sum + Number(item.value ?? 0),
      0,
    )
    return String(total)
  }, [recruitmentMetric, loadingRecruitment])

  const summaryCards = [
    {
      label: "Total Employees",
      value: fmt(loadingTotal, totalMetric?.value),
      detail: totalMetric?.description ?? "All personnel records",
      icon: Users,
    },
    {
      label: "Active Employees",
      value: fmt(loadingActive, activeMetric?.value),
      detail: activeMetric?.description ?? "Currently active staff",
      icon: UserRoundPlus,
    },
    {
      label: "Open Applicants",
      value: openApplicants,
      detail: "Across all recruitment stages",
      icon: FileCheck2,
    },
    {
      label: "Documents Expiring",
      value: fmt(loadingDocs, docsExpiringMetric?.value),
      detail: docsExpiringMetric?.description ?? "Within the next 30 days",
      icon: CalendarClock,
    },
  ]

  // Build department rows from the API breakdown
  const departmentRows = React.useMemo(() => {
    if (!byDepartmentMetric) return []
    return (byDepartmentMetric.items ?? []).slice(0, 4).map((item) => ({
      name: item.label,
      headcount: Number(item.value ?? 0),
    }))
  }, [byDepartmentMetric])

  return (
    <PermissionGuard requiredPermission="hrms.dashboard.view">
    {totalError ? (
      <ApiErrorView error={totalError} onRetry={refreshDashboard} fullScreen />
    ) : (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Badge variant="outline" className="mb-3 rounded-md">
            HRM Module
          </Badge>
          <h1 className="text-2xl font-semibold tracking-normal">
            HRM Dashboard
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
            Monitor personnel records, applicant movement, and HR tasks across
            the institution.
          </p>
        </div>

        <Button asChild>
          <Link href="/hrm/applicants">
            View applicants
            <ArrowUpRight className="size-4" />
          </Link>
        </Button>
      </div>

      {/* Summary Cards Grid Section */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon

          return (
            <Card key={card.label} className="rounded-lg">
              <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
                <div>
                  <CardDescription>{card.label}</CardDescription>
                  <CardTitle className="mt-2 text-3xl font-semibold">
                    {card.value}
                  </CardTitle>
                </div>
                <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-700/10 text-emerald-700">
                  <Icon className="size-5" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{card.detail}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Visual Component Split Block */}
      <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Applicant Pipeline</CardTitle>
            <CardDescription>
              Current applicant counts by recruitment stage.
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                  <TableRow>
                    <TableCell colSpan={3} className="py-6 text-center text-sm text-muted-foreground">
                      Loading pipeline…
                    </TableCell>
                  </TableRow>
                ) : recruitmentMetric?.items && recruitmentMetric.items.length > 0
                  ? recruitmentMetric.items.map((item) => (
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
                  : pipeline.map((item) => (
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
                }
              </TableBody>
            </Table>
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
          <CardContent className="space-y-5">
            {loadingByDept ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
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

      {/* Footer Actions Panel */}
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
    )}
    </PermissionGuard>
  )
}