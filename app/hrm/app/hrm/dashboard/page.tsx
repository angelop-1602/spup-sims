"use client"

import * as React from "react"
import Link from "next/link"
import { useApiQuery } from "@/lib/api"
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

const pipeline = [
  { stage: "Application Screening", count: 18, status: "In progress" },
  { stage: "Initial Interview", count: 8, status: "Scheduled" },
  { stage: "Final Interview", count: 6, status: "For panel" },
  { stage: "Job Offer", count: 4, status: "Pending" },
] as const

const departments = [
  { name: "Academic Affairs", headcount: 96, capacity: 82 },
  { name: "Student Services", headcount: 42, capacity: 76 },
  { name: "Finance and Administration", headcount: 38, capacity: 68 },
  { name: "Facilities", headcount: 31, capacity: 71 },
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

export default function HrmDashboardPage() {
  const { data: employeeMetric, loading } = useApiQuery<DashboardMetricResponse>("/api/v1/hrms/dashboard/cards/employees-total")

  const employeeCount = loading
    ? "..."
    : (employeeMetric?.value ?? 0)

  const summaryCards = [
    {
      label: "Active Employees",
      value: employeeCount.toString(),
      detail: "12 departments covered",
      icon: Users,
    },
    {
      label: "Open Applicants",
      value: "36",
      detail: "8 scheduled for interview",
      icon: UserRoundPlus,
    },
    {
      label: "For Review",
      value: "14",
      detail: "Contracts and personnel files",
      icon: FileCheck2,
    },
    {
      label: "Due This Week",
      value: "9",
      detail: "Onboarding and evaluations",
      icon: CalendarClock,
    },
  ] as const

  return (
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
                {pipeline.map((item) => (
                  <TableRow key={item.stage}>
                    <TableCell className="font-medium">{item.stage}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="rounded-md">
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{item.count}</TableCell>
                  </TableRow>
                ))}
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
            <CardTitle>Workforce Allocation</CardTitle>
            <CardDescription>
              Department staffing against planned capacity.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {departments.map((department) => (
              <div key={department.name} className="space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">{department.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {department.headcount} active employees
                    </p>
                  </div>
                  <p className="text-sm font-medium">{department.capacity}%</p>
                </div>
                <Progress value={department.capacity} />
              </div>
            ))}
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
  )
}