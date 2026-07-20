"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AlertTriangle, ArrowLeft, Loader2, ShieldCheck, UserRound, Users } from "lucide-react"
import { PermissionGuard } from "@/components/auth/permission-guard"
import { useHrmAuth } from "@/components/auth/hrm-auth-guard"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  useApiQuery,
  useApiMutation,
  ApiError,
  type DepartmentResponse,
  type EmployeeResponse,
  type PagedResponseOfEmployeeResponse,
  type SchoolYearResponse,
  type EmployeeSchoolYearAssignmentResponse,
  type PagedResponseOfEmployeeSchoolYearAssignmentResponse,
  type CreateEmployeeSchoolYearAssignmentRequest,
  type UpdateEmployeeSchoolYearAssignmentRequest,
} from "@/lib/api"
import { ApiErrorView } from "@/components/ui/api-error-view"

// Mirrors SIS.Domain.Platform.EmploymentStatus
const EMPLOYMENT_STATUS_LABEL: Record<number, string> = {
  0: "Applicant",
  1: "Active",
  2: "Probationary",
  3: "Contractual",
  4: "Resigned",
  5: "Retired",
  6: "Terminated",
  7: "Inactive",
}

const EMPLOYMENT_STATUS_STYLE: Record<number, string> = {
  1: "bg-green-50 text-green-700",
  2: "bg-blue-50 text-blue-700",
  3: "bg-blue-50 text-blue-700",
  4: "bg-zinc-100 text-zinc-600",
  5: "bg-zinc-100 text-zinc-600",
  6: "bg-red-50 text-red-700",
  7: "bg-zinc-100 text-zinc-600",
}

const EMPTY_EMPLOYEES: EmployeeResponse[] = []
const EMPTY_ASSIGNMENTS: EmployeeSchoolYearAssignmentResponse[] = []

function isNotFound(error: Error | null) {
  return error instanceof ApiError && error.status === 404
}

function isForbiddenError(error: Error | null) {
  return error instanceof ApiError && error.status === 403
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default function DepartmentDetailPage({ params }: PageProps) {
  const { id } = React.use(params)
  const router = useRouter()
  const { hasPermission } = useHrmAuth()

  // Browsing any department's page (info, roster, current head) only requires
  // org.departments.view — it's not scoped to the viewer's own department.
  // Managing headship is a separate, more privileged action gated below.
  // Reassigning a department head requires updating (and possibly creating) a
  // school-year assignment row.
  const canManageHead = hasPermission("hrms.schoolYears.update")
  const canCreateAssignment = hasPermission("hrms.schoolYears.create")

  const {
    data: department,
    loading: loadingDepartment,
    error: departmentError,
    refresh: refreshDepartment,
  } = useApiQuery<DepartmentResponse>(`/api/v1/organization/departments/${id}`)

  const {
    data: employeesData,
    loading: loadingEmployees,
    error: employeesError,
    refresh: refreshEmployees,
  } = useApiQuery<PagedResponseOfEmployeeResponse>("/api/v1/hrms/employees", {
    DepartmentId: id,
    Page: 1,
    PageSize: 200,
    SortBy: "lastName",
  })

  const {
    data: currentSchoolYear,
    error: schoolYearError,
  } = useApiQuery<SchoolYearResponse>("/api/v1/academic/school-years/current")
  const currentSchoolYearId = currentSchoolYear?.id ?? null
  const noCurrentSchoolYear = isNotFound(schoolYearError)

  const {
    data: headAssignmentsData,
    loading: loadingHead,
    error: headError,
    refresh: refreshHeadAssignment,
  } = useApiQuery<PagedResponseOfEmployeeSchoolYearAssignmentResponse>(
    "/api/v1/hrms/employee-school-years",
    {
      DepartmentId: id,
      SchoolYearId: currentSchoolYearId ?? undefined,
      IsDepartmentHead: true,
      Page: 1,
      PageSize: 1,
    },
    { enabled: Boolean(currentSchoolYearId) },
  )

  // Only fetched when the "Change head" flow is actually usable, to avoid an
  // extra request users without hrms.schoolYears.update can't act on anyway.
  const {
    data: assignmentsData,
    refresh: refreshAssignments,
  } = useApiQuery<PagedResponseOfEmployeeSchoolYearAssignmentResponse>(
    "/api/v1/hrms/employee-school-years",
    {
      DepartmentId: id,
      SchoolYearId: currentSchoolYearId ?? undefined,
      Page: 1,
      PageSize: 200,
    },
    { enabled: canManageHead && Boolean(currentSchoolYearId) },
  )

  const employees = employeesData?.data ?? EMPTY_EMPLOYEES
  const totalRecords = Number(employeesData?.totalRecords ?? employees.length)
  const headAssignment = headAssignmentsData?.data?.[0] ?? null
  const assignments = assignmentsData?.data ?? EMPTY_ASSIGNMENTS

  const [manageOpen, setManageOpen] = React.useState(false)

  return (
    <PermissionGuard requiredPermission="org.departments.view">
      <div className="space-y-6">
        <Link
          href="/hrm/departments"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Departments
        </Link>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">
              {department?.name ?? "Department"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {department?.code ? `Code: ${department.code}` : "Department details, head, and employee roster."}
            </p>
          </div>
          {department && (
            <div className="flex flex-wrap items-center gap-2">
              {department.parentDepartmentName && (
                <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                  Under {department.parentDepartmentName}
                </span>
              )}
              <span
                className={
                  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium " +
                  (department.isActive ? "bg-green-50 text-green-700" : "bg-zinc-100 text-zinc-600")
                }
              >
                {department.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          )}
        </div>

        {loadingDepartment ? (
          <div className="flex items-center justify-center gap-2 rounded-lg border bg-card p-10 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading department…
          </div>
        ) : departmentError ? (
          <ApiErrorView error={departmentError} onRetry={refreshDepartment} fullScreen />
        ) : (
          <div className="rounded-lg border bg-card p-6">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                Department Head
                {currentSchoolYear && (
                  <span className="text-xs font-normal text-muted-foreground">
                    ({currentSchoolYear.name})
                  </span>
                )}
              </div>
              {canManageHead && !noCurrentSchoolYear && !isForbiddenError(headError) && (
                <Button variant="outline" size="sm" onClick={() => setManageOpen(true)}>
                  {headAssignment ? "Change head" : "Assign head"}
                </Button>
              )}
            </div>

            {noCurrentSchoolYear ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                No current school year is set, so a department head can&apos;t be determined.
              </p>
            ) : isForbiddenError(headError) ? (
              <p className="text-sm text-muted-foreground">
                You don&apos;t have permission to view department head assignments.
              </p>
            ) : loadingHead ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading…
              </div>
            ) : headError ? (
              <ApiErrorView error={headError} onRetry={refreshHeadAssignment} />
            ) : headAssignment ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {(headAssignment.employeeName ?? "?").charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{headAssignment.employeeName}</p>
                    <p className="text-sm text-muted-foreground">{headAssignment.position}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/hrm/portfolio/${headAssignment.employeeId}`)}
                >
                  <UserRound className="mr-2 h-4 w-4" />
                  View profile
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No department head is currently assigned for this school year.
              </p>
            )}
          </div>
        )}

        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Users className="h-4 w-4 text-muted-foreground" />
            Employees
            {!loadingEmployees && !employeesError && (
              <span className="text-xs font-normal text-muted-foreground">
                ({totalRecords})
              </span>
            )}
          </div>

          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee #</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date Hired</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loadingEmployees ? (
                  <TableRow>
                    <TableCell colSpan={6} className="p-6 text-center">
                      <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading employees...
                      </span>
                    </TableCell>
                  </TableRow>
                ) : employeesError ? (
                  <TableRow>
                    <TableCell colSpan={6} className="p-0">
                      <ApiErrorView error={employeesError} onRetry={refreshEmployees} fullScreen />
                    </TableCell>
                  </TableRow>
                ) : employees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="p-6 text-center text-sm text-muted-foreground">
                      No employees are assigned to this department.
                    </TableCell>
                  </TableRow>
                ) : (
                  employees.map((employee) => {
                    const status = Number(employee.employmentStatus ?? 0)
                    const isHead = headAssignment && String(headAssignment.employeeId) === String(employee.id)
                    return (
                      <TableRow key={String(employee.id)}>
                        <TableCell>{employee.employeeNumber}</TableCell>
                        <TableCell className="font-medium">
                          {employee.fullName}
                          {isHead && (
                            <span className="ml-2 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                              Head
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{employee.position ?? "-"}</TableCell>
                        <TableCell>
                          <span
                            className={
                              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium " +
                              (EMPLOYMENT_STATUS_STYLE[status] ?? "bg-zinc-100 text-zinc-600")
                            }
                          >
                            {EMPLOYMENT_STATUS_LABEL[status] ?? "Unknown"}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {employee.dateHired
                            ? new Date(employee.dateHired).toLocaleDateString("en-US", {
                                year: "numeric", month: "short", day: "numeric",
                              })
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/hrm/portfolio/${employee.id}`)}
                          >
                            <UserRound className="mr-2 h-4 w-4" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {department && currentSchoolYear && (
        <ChangeDepartmentHeadDialog
          open={manageOpen}
          onOpenChange={setManageOpen}
          departmentId={id}
          departmentName={department.name}
          schoolYear={currentSchoolYear}
          currentHead={headAssignment}
          employees={employees}
          assignments={assignments}
          canCreateAssignment={canCreateAssignment}
          onChanged={() => {
            void refreshHeadAssignment()
            void refreshAssignments()
          }}
        />
      )}
    </PermissionGuard>
  )
}

type ChangeDepartmentHeadDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  departmentId: string
  departmentName: string
  schoolYear: SchoolYearResponse
  currentHead: EmployeeSchoolYearAssignmentResponse | null
  employees: EmployeeResponse[]
  assignments: EmployeeSchoolYearAssignmentResponse[]
  canCreateAssignment: boolean
  onChanged: () => void
}

function ChangeDepartmentHeadDialog({
  open,
  onOpenChange,
  departmentId,
  departmentName,
  schoolYear,
  currentHead,
  employees,
  assignments,
  canCreateAssignment,
  onChanged,
}: ChangeDepartmentHeadDialogProps) {
  const [step, setStep] = React.useState<"select" | "confirm">("select")
  const [selectedEmployeeId, setSelectedEmployeeId] = React.useState("")
  const [newPositionId, setNewPositionId] = React.useState<number | string | null>(null)
  const [newStatus, setNewStatus] = React.useState("1")
  const [newIsFaculty, setNewIsFaculty] = React.useState(false)
  const [newStartDate, setNewStartDate] = React.useState(() => new Date().toISOString().slice(0, 10))
  const [error, setError] = React.useState<string | null>(null)
  const { mutate, loading: saving, lastErrorRef } = useApiMutation()

  const reset = React.useCallback(() => {
    setStep("select")
    setSelectedEmployeeId("")
    setNewPositionId(null)
    setNewStatus("1")
    setNewIsFaculty(false)
    setNewStartDate(new Date().toISOString().slice(0, 10))
    setError(null)
  }, [])

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen)
    if (!nextOpen) reset()
  }

  const selectedEmployee = employees.find((e) => String(e.id) === selectedEmployeeId) ?? null
  const existingAssignment = assignments.find((a) => String(a.employeeId) === selectedEmployeeId) ?? null
  const candidates = employees.filter((e) => String(e.id) !== String(currentHead?.employeeId ?? ""))
  const needsNewAssignment = Boolean(selectedEmployeeId) && !existingAssignment

  function handleSelectEmployee(employeeId: string) {
    setSelectedEmployeeId(employeeId)
    const employee = employees.find((e) => String(e.id) === employeeId)
    const hasAssignment = assignments.some((a) => String(a.employeeId) === employeeId)
    if (employee && !hasAssignment) {
      setNewPositionId(employee.positionId ?? null)
      setNewStatus(String(employee.employmentStatus ?? 1))
    }
  }

  async function handleContinue() {
    setError(null)
    if (!selectedEmployeeId) {
      setError("Select an employee to assign as department head.")
      return
    }
    if (needsNewAssignment && !canCreateAssignment) {
      setError(
        "This employee has no school-year assignment for this department yet, and you don't have permission to create one.",
      )
      return
    }
    setStep("confirm")
  }

  async function handleConfirm() {
    setError(null)

    // Step 1 of 2: remove the outgoing head, if any and different from the incoming one.
    if (currentHead && String(currentHead.employeeId) !== selectedEmployeeId) {
      const removeBody: UpdateEmployeeSchoolYearAssignmentRequest = {
        departmentId: currentHead.departmentId,
        positionId: currentHead.positionId,
        status: currentHead.status,
        isFaculty: currentHead.isFaculty,
        isActive: currentHead.isActive,
        startDate: currentHead.startDate,
        endDate: currentHead.endDate,
        isDepartmentHead: false,
      }
      const removed = await mutate({
        path: `/api/v1/hrms/employee-school-years/${currentHead.id}`,
        method: "PUT",
        body: removeBody,
      })
      if (!removed) {
        setError(
          lastErrorRef.current?.message ??
            `Unable to remove ${currentHead.employeeName} as head. No changes were made.`,
        )
        return
      }
    }

    // Step 2 of 2: mark the incoming employee as head.
    let assigned: boolean
    if (existingAssignment) {
      const assignBody: UpdateEmployeeSchoolYearAssignmentRequest = {
        departmentId: existingAssignment.departmentId,
        positionId: existingAssignment.positionId,
        status: existingAssignment.status,
        isFaculty: existingAssignment.isFaculty,
        isActive: existingAssignment.isActive,
        startDate: existingAssignment.startDate,
        endDate: existingAssignment.endDate,
        isDepartmentHead: true,
      }
      assigned = await mutate({
        path: `/api/v1/hrms/employee-school-years/${existingAssignment.id}`,
        method: "PUT",
        body: assignBody,
      })
    } else {
      const createBody: CreateEmployeeSchoolYearAssignmentRequest = {
        employeeId: Number(selectedEmployeeId),
        schoolYearId: Number(schoolYear.id),
        departmentId: Number(departmentId),
        positionId: Number(newPositionId),
        status: Number(newStatus),
        isFaculty: newIsFaculty,
        startDate: newStartDate,
        endDate: null,
        isDepartmentHead: true,
      }
      assigned = await mutate({
        path: "/api/v1/hrms/employee-school-years",
        method: "POST",
        body: createBody,
      })
    }

    if (!assigned) {
      const reason = lastErrorRef.current?.message
      setError(
        reason ??
          (currentHead
            ? `${currentHead.employeeName} was removed as head, but assigning the new head failed. Please try again.`
            : "Unable to assign the new department head."),
      )
      return
    }

    onChanged()
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{currentHead ? "Change department head" : "Assign department head"}</DialogTitle>
          <DialogDescription>
            {schoolYear.name} · {departmentName}
          </DialogDescription>
        </DialogHeader>

        {step === "select" ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>New department head</Label>
              <Select value={selectedEmployeeId} onValueChange={handleSelectEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an employee" />
                </SelectTrigger>
                <SelectContent>
                  {candidates.map((employee) => (
                    <SelectItem key={String(employee.id)} value={String(employee.id)}>
                      {employee.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {needsNewAssignment && (
              <div className="space-y-4 rounded-md border bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground">
                  {selectedEmployee?.fullName} doesn&apos;t have a school-year assignment for this
                  department yet. One will be created.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="head-status">Employment status</Label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger id="head-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(EMPLOYMENT_STATUS_LABEL).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="head-start-date">Start date</Label>
                  <Input
                    id="head-start-date"
                    type="date"
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="head-is-faculty"
                    checked={newIsFaculty}
                    onCheckedChange={(checked) => setNewIsFaculty(checked === true)}
                  />
                  <Label htmlFor="head-is-faculty" className="font-normal">Faculty member</Label>
                </div>
              </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleContinue}>
                Continue
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm">
              {currentHead && String(currentHead.employeeId) !== selectedEmployeeId ? (
                <>
                  This will remove <strong>{currentHead.employeeName}</strong> as head of{" "}
                  <strong>{departmentName}</strong> before assigning{" "}
                  <strong>{selectedEmployee?.fullName}</strong> as the new head.
                </>
              ) : (
                <>
                  This will assign <strong>{selectedEmployee?.fullName}</strong> as head of{" "}
                  <strong>{departmentName}</strong> for {schoolYear.name}.
                </>
              )}
            </p>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setStep("select")} disabled={saving}>
                Back
              </Button>
              <Button type="button" onClick={handleConfirm} disabled={saving}>
                {saving ? "Saving…" : "Confirm"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
