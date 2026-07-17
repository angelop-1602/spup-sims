"use client"

import * as React from "react"
import { format } from "date-fns"
import { Check, Loader2, Search, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { useApiQuery, useApiMutation, type components } from "@/lib/api"
import { ApiErrorView } from "@/components/ui/error-page"
import { formatDays, formatStatus, statusVariant } from "./leave-status"

type LeaveApplication = components["schemas"]["LeaveApplicationResponse"]
type PagedLeaveApplications =
  components["schemas"]["PagedResponseOfLeaveApplicationResponse"]
type PagedDepartments =
  components["schemas"]["PagedResponseOfDepartmentResponse"]

const PAGE_SIZE = 10

type ApprovalsTabProps = {
  /** Which approval stage this tab handles. */
  stage: "dept" | "hr"
}

const STAGE_CONFIG = {
  dept: {
    listPath: "/api/v1/hrms/leave-applications/pending-dept-approval",
    approvePath: (id: number | string) =>
      `/api/v1/hrms/leave-applications/${id}/dept-approve`,
    rejectPath: (id: number | string) =>
      `/api/v1/hrms/leave-applications/${id}/dept-reject`,
    title: "Pending department approval",
    description:
      "Leave applications from your department awaiting your decision.",
  },
  hr: {
    listPath: "/api/v1/hrms/leave-applications/pending-hr-approval",
    approvePath: (id: number | string) =>
      `/api/v1/hrms/leave-applications/${id}/hr-approve`,
    rejectPath: (id: number | string) =>
      `/api/v1/hrms/leave-applications/${id}/hr-reject`,
    title: "Pending HR approval",
    description:
      "Department-approved leave applications awaiting final HR review.",
  },
} as const

type DecisionState = {
  application: LeaveApplication
  action: "approve" | "reject"
}

export default function ApprovalsTab({ stage }: ApprovalsTabProps) {
  const config = STAGE_CONFIG[stage]
  const showDepartmentFilter = stage === "hr"

  const [page, setPage] = React.useState(1)
  const [searchInput, setSearchInput] = React.useState("")
  const [search, setSearch] = React.useState("")
  const [departmentId, setDepartmentId] = React.useState<string>("all")

  // Debounce search so we don't refetch on every keystroke.
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchInput])

  const {
    data: paged,
    loading,
    error,
    refresh,
  } = useApiQuery<PagedLeaveApplications>(config.listPath, {
    Page: page,
    PageSize: PAGE_SIZE,
    Search: search || undefined,
    DepartmentId:
      showDepartmentFilter && departmentId !== "all" ? departmentId : undefined,
  })

  const { data: departmentsData } = useApiQuery<PagedDepartments>(
    showDepartmentFilter ? "/api/v1/organization/departments" : null,
    { Page: 1, PageSize: 100, SortBy: "id" },
  )
  const departments = departmentsData?.data ?? []

  const applications = paged?.data ?? []
  const totalPages = Number(paged?.totalPages ?? 1)
  const totalRecords = Number(paged?.totalRecords ?? applications.length)

  const [decision, setDecision] = React.useState<DecisionState | null>(null)
  const [remarks, setRemarks] = React.useState("")
  const [decisionError, setDecisionError] = React.useState<string | null>(null)

  const { mutate, loading: deciding } = useApiMutation()

  const openDecision = (
    application: LeaveApplication,
    action: "approve" | "reject",
  ) => {
    setDecision({ application, action })
    setRemarks("")
    setDecisionError(null)
  }

  const handleDecision = async () => {
    if (!decision) return
    setDecisionError(null)

    const isReject = decision.action === "reject"
    if (isReject && !remarks.trim()) {
      setDecisionError("Remarks are required when rejecting an application.")
      return
    }

    const path = isReject
      ? config.rejectPath(decision.application.id)
      : config.approvePath(decision.application.id)

    const body:
      | components["schemas"]["ApproveLeaveRequest"]
      | components["schemas"]["RejectLeaveRequest"] = isReject
      ? { remarks: remarks.trim() }
      : { remarks: remarks.trim() || null }

    const ok = await mutate({ path, method: "POST", body })
    if (!ok) {
      setDecisionError(
        `Unable to ${decision.action} this application. Please try again.`,
      )
      return
    }

    setDecision(null)
    refresh()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{config.title}</CardTitle>
        <CardDescription>{config.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by employee or leave type..."
              className="pl-8"
            />
          </div>
          {showDepartmentFilter && (
            <Select
              value={departmentId}
              onValueChange={(value) => {
                setDepartmentId(value)
                setPage(1)
              }}
            >
              <SelectTrigger className="sm:w-56">
                <SelectValue placeholder="All departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All departments</SelectItem>
                {departments.map((department) => (
                  <SelectItem
                    key={String(department.id)}
                    value={String(department.id)}
                  >
                    {department.name ?? ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                {showDepartmentFilter && <TableHead>Department</TableHead>}
                <TableHead>Leave type</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={showDepartmentFilter ? 9 : 8}
                    className="p-6 text-center"
                  >
                    <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading applications...
                    </span>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={showDepartmentFilter ? 9 : 8} className="p-0">
                    <ApiErrorView error={error} onRetry={refresh} fullScreen />
                  </TableCell>
                </TableRow>
              ) : applications.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={showDepartmentFilter ? 9 : 8}
                    className="p-6 text-center text-sm text-muted-foreground"
                  >
                    No leave applications awaiting approval.
                  </TableCell>
                </TableRow>
              ) : (
                applications.map((application) => (
                  <TableRow key={String(application.id)}>
                    <TableCell className="font-medium">
                      {application.employeeName}
                    </TableCell>
                    {showDepartmentFilter && (
                      <TableCell>{application.departmentName ?? "—"}</TableCell>
                    )}
                    <TableCell>{application.leaveTypeName}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{application.startDate}</p>
                        <p className="text-muted-foreground">
                          to {application.endDate}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{formatDays(application.totalDays)}</TableCell>
                    <TableCell className="max-w-48">
                      <p className="truncate text-sm" title={application.reason}>
                        {application.reason}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(application.status)}>
                        {formatStatus(application.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {application.submittedAtUtc
                        ? format(new Date(application.submittedAtUtc), "MMM d, yyyy")
                        : "—"}
                    </TableCell>
                    <TableCell className="space-x-2 text-right">
                      <Button
                        size="sm"
                        onClick={() => openDecision(application, "approve")}
                        disabled={deciding}
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => openDecision(application, "reject")}
                        disabled={deciding}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>
              Page {page} of {totalPages} · {totalRecords} pending
            </p>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1 || loading}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
                disabled={page >= totalPages || loading}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      <Dialog
        open={Boolean(decision)}
        onOpenChange={(open) => !open && setDecision(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {decision?.action === "reject"
                ? "Reject leave application"
                : "Approve leave application"}
            </DialogTitle>
            <DialogDescription>
              {decision ? (
                <>
                  <strong>{decision.application.employeeName}</strong> —{" "}
                  {decision.application.leaveTypeName},{" "}
                  {decision.application.startDate} to{" "}
                  {decision.application.endDate} (
                  {formatDays(decision.application.totalDays)} day
                  {formatDays(decision.application.totalDays) === "1" ? "" : "s"})
                </>
              ) : null}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="decision-remarks">
              Remarks{decision?.action === "reject" ? "" : " (optional)"}
            </Label>
            <Textarea
              id="decision-remarks"
              value={remarks}
              onChange={(event) => setRemarks(event.target.value)}
              placeholder={
                decision?.action === "reject"
                  ? "Explain why this application is being rejected"
                  : "Add a note for the employee (optional)"
              }
              rows={3}
            />
          </div>

          {decisionError ? (
            <p className="text-sm text-destructive">{decisionError}</p>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDecision(null)}>
              Cancel
            </Button>
            <Button
              variant={decision?.action === "reject" ? "destructive" : "default"}
              onClick={handleDecision}
              disabled={
                deciding ||
                (decision?.action === "reject" && !remarks.trim())
              }
            >
              {deciding ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : decision?.action === "reject" ? (
                <X className="mr-2 h-4 w-4" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              {decision?.action === "reject" ? "Reject" : "Approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
