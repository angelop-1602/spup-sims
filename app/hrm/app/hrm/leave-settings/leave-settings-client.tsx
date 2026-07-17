"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useApiQuery, useApiMutation, type components } from "@/lib/api"
import { useHrmAuth } from "@/components/auth/hrm-auth-guard"
import { PermissionGuard } from "@/components/auth/permission-guard"
import { ApiErrorView } from "@/components/ui/error-page"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Edit3, Loader2, Plus, Save, Trash2 } from "lucide-react"

type LeaveType = components["schemas"]["LeaveTypeResponse"]
type LeaveBalance = components["schemas"]["LeaveBalanceResponse"]
type Employee = components["schemas"]["EmployeeResponse"]
type PagedEmployees = components["schemas"]["PagedResponseOfEmployeeResponse"]
type SchoolYear = components["schemas"]["SchoolYearResponse"]
type PagedSchoolYears = components["schemas"]["PagedResponseOfSchoolYearResponse"]

const currentYear = new Date().getFullYear().toString()

function formatDays(value: number | string | undefined) {
  return String(value ?? 0)
}

function normalizeLeaveTypes(value: unknown): LeaveType[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is LeaveType => Boolean(item && typeof item === "object"))
  }

  if (!value || typeof value !== "object") {
    return []
  }

  const record = value as Record<string, unknown>
  for (const key of ["data", "items", "value", "results", "leaveTypes"]) {
    const candidate = record[key]
    if (Array.isArray(candidate)) {
      return candidate.filter((item): item is LeaveType => Boolean(item && typeof item === "object"))
    }
  }

  return []
}

export default function LeaveSettingsClient() {
  const { hasPermission } = useHrmAuth()

  const canCreateType = hasPermission("hrms.leaveTypes.create")
  const canUpdateType = hasPermission("hrms.leaveTypes.update")
  const canDeleteType = hasPermission("hrms.leaveTypes.delete")
  const canAdjustBalance = hasPermission("hrms.leaveBalances.update")

  const [selectedType, setSelectedType] = React.useState<LeaveType | null>(null)
  const [typeForm, setTypeForm] = React.useState({
    name: "",
    code: "",
    maxDaysPerYear: "",
    requiresMedicalCertificate: false,
    isPaid: true,
    isActive: true,
  })
  const [selectedEmployeeId, setSelectedEmployeeId] = React.useState<string>("")
  const [selectedSchoolYear, setSelectedSchoolYear] = React.useState<string>("")
  const [adjustForm, setAdjustForm] = React.useState({
    leaveTypeId: "",
    totalDays: "",
    reason: "Balance adjustment",
  })

  const {
    data: apiLeaveTypes,
    loading: loadingLeaveTypes,
    refresh: refreshLeaveTypes,
  } = useApiQuery<LeaveType[]>("/api/v1/hrms/leave-types")

  const leaveTypes = React.useMemo(
    () => normalizeLeaveTypes(apiLeaveTypes),
    [apiLeaveTypes],
  )

  const {
    data: employeesPaged,
    loading: loadingEmployees,
    error: employeesError,
  } = useApiQuery<PagedEmployees>("/api/v1/hrms/employees", {
    Page: 1,
    PageSize: 100,
  })

  const employees = employeesPaged?.data ?? []

  const {
    data: schoolYearsPaged,
    loading: loadingSchoolYears,
  } = useApiQuery<PagedSchoolYears>("/api/v1/academic/school-years", {
    Page: 1,
    PageSize: 100,
    SortBy: "startDate",
    Descending: false,
  })

  const schoolYears = React.useMemo(() => schoolYearsPaged?.data ?? [], [schoolYearsPaged])

  React.useEffect(() => {
    if (!selectedEmployeeId && employees.length) {
      setSelectedEmployeeId(String(employees[0].id ?? ""))
    }
  }, [employees, selectedEmployeeId])

  React.useEffect(() => {
    if (!selectedSchoolYear && schoolYears.length) {
      const activeSchoolYear = schoolYears.find((schoolYear) => schoolYear.isActive) ?? schoolYears[0]
      setSelectedSchoolYear(String(activeSchoolYear?.id ?? ""))
    }
  }, [schoolYears, selectedSchoolYear])

  React.useEffect(() => {
    if (!adjustForm.leaveTypeId && leaveTypes.length) {
      setAdjustForm((current) => ({
        ...current,
        leaveTypeId: String(leaveTypes[0].id),
      }))
    }
  }, [leaveTypes, adjustForm.leaveTypeId])

  const leaveBalancesPath = selectedEmployeeId
    ? `/api/v1/hrms/leave-balances/employee/${selectedEmployeeId}/school-year/${selectedSchoolYear}`
    : undefined

  const {
    data: leaveBalances,
    loading: loadingBalances,
    refresh: refreshLeaveBalances,
    error: leaveBalancesError,
  } = useApiQuery<LeaveBalance[]>(leaveBalancesPath, undefined, {
    enabled: Boolean(selectedEmployeeId && selectedSchoolYear),
  })

  const { mutate: saveLeaveType, loading: savingLeaveType } = useApiMutation()
  const { mutate: deleteLeaveType, loading: deletingLeaveType } = useApiMutation()
  const { mutate: adjustLeaveBalance, loading: adjustingBalance } = useApiMutation()

  const resetTypeForm = () => {
    setSelectedType(null)
    setTypeForm({
      name: "",
      code: "",
      maxDaysPerYear: "",
      requiresMedicalCertificate: false,
      isPaid: true,
      isActive: true,
    })
  }

  const handleTypeSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!typeForm.name.trim() || !typeForm.code.trim()) {
      return
    }

    const body = {
      name: typeForm.name.trim(),
      code: typeForm.code.trim().toUpperCase(),
      maxDaysPerYear: Number(typeForm.maxDaysPerYear) || 0,
      requiresMedicalCertificate: typeForm.requiresMedicalCertificate,
      isPaid: typeForm.isPaid,
      isActive: typeForm.isActive,
    }

    const path = selectedType
      ? `/api/v1/hrms/leave-types/${selectedType.id}`
      : "/api/v1/hrms/leave-types"
    const method = selectedType ? "PUT" : "POST"

    const success = await saveLeaveType({ path, method, body })

    if (success) {
      await refreshLeaveTypes()
      resetTypeForm()
    }
  }

  const handleTypeEdit = (leaveType: LeaveType) => {
    setSelectedType(leaveType)
    setTypeForm({
      name: leaveType.name ?? "",
      code: leaveType.code ?? "",
      maxDaysPerYear: formatDays(leaveType.maxDaysPerYear),
      requiresMedicalCertificate: Boolean(leaveType.requiresMedicalCertificate),
      isPaid: Boolean(leaveType.isPaid),
      isActive: Boolean(leaveType.isActive),
    })
  }

  const handleTypeDelete = async (leaveType: LeaveType) => {
    const success = await deleteLeaveType({
      path: `/api/v1/hrms/leave-types/${leaveType.id}`,
      method: "DELETE",
    })

    if (success) {
      await refreshLeaveTypes()
      if (selectedType?.id === leaveType.id) {
        resetTypeForm()
      }
    }
  }

  const handleAdjustSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedEmployeeId || !adjustForm.leaveTypeId || !adjustForm.reason.trim()) {
      return
    }

    const success = await adjustLeaveBalance({
      path: "/api/v1/hrms/leave-balances/adjust",
      method: "POST",
      body: {
        employeeId: Number(selectedEmployeeId),
        leaveTypeId: Number(adjustForm.leaveTypeId),
        schoolYearId: Number(selectedSchoolYear),
        totalDays: Number(adjustForm.totalDays) || undefined,
        reason: adjustForm.reason.trim(),
      },
    })

    if (success) {
      await refreshLeaveBalances()
      setAdjustForm((current) => ({ ...current, totalDays: "" }))
    }
  }

  const selectedEmployee = employees.find(
    (employee) => String(employee.id) === selectedEmployeeId,
  )

  return (
    <PermissionGuard requiredPermission="hrms.leaveTypes.view">
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <Card>
        <CardHeader>
          <CardTitle>Leave types</CardTitle>
          <CardDescription>
            Create and maintain leave categories using the HRMS leave-types API.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <form className="space-y-4" onSubmit={handleTypeSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="leave-name">Leave type name</Label>
                <Input
                  id="leave-name"
                  value={typeForm.name}
                  onChange={(event) =>
                    setTypeForm((current) => ({ ...current, name: event.target.value }))
                  }
                  placeholder="Vacation Leave"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="leave-code">Code</Label>
                <Input
                  id="leave-code"
                  value={typeForm.code}
                  onChange={(event) =>
                    setTypeForm((current) => ({ ...current, code: event.target.value }))
                  }
                  placeholder="VAC"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="leave-days">Max days per year</Label>
                <Input
                  id="leave-days"
                  type="number"
                  min="0"
                  value={typeForm.maxDaysPerYear}
                  onChange={(event) =>
                    setTypeForm((current) => ({
                      ...current,
                      maxDaysPerYear: event.target.value,
                    }))
                  }
                  placeholder="20"
                />
              </div>
              <div className="space-y-2 rounded-md border p-3">
                <div className="flex items-center gap-2">
                  <input
                    id="requires-medical"
                    type="checkbox"
                    checked={typeForm.requiresMedicalCertificate}
                    onChange={(event) =>
                      setTypeForm((current) => ({
                        ...current,
                        requiresMedicalCertificate: event.target.checked,
                      }))
                    }
                  />
                  <Label htmlFor="requires-medical">Requires medical certificate</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="is-paid"
                    type="checkbox"
                    checked={typeForm.isPaid}
                    onChange={(event) =>
                      setTypeForm((current) => ({ ...current, isPaid: event.target.checked }))
                    }
                  />
                  <Label htmlFor="is-paid">Paid leave</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="is-active"
                    type="checkbox"
                    checked={typeForm.isActive}
                    onChange={(event) =>
                      setTypeForm((current) => ({ ...current, isActive: event.target.checked }))
                    }
                  />
                  <Label htmlFor="is-active">Active</Label>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {(canCreateType || canUpdateType) && (
              <Button type="submit" disabled={savingLeaveType}>
                {savingLeaveType ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : selectedType ? (
                  <Save className="mr-2 h-4 w-4" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                {selectedType ? "Save changes" : "Add leave type"}
              </Button>
              )}
              {selectedType ? (
                <Button type="button" variant="outline" onClick={resetTypeForm}>
                  Cancel
                </Button>
              ) : null}
            </div>
          </form>

          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingLeaveTypes && (
                  <TableRow>
                    <TableCell colSpan={3} className="p-6 text-center">
                      <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading leave types...
                      </span>
                    </TableCell>
                  </TableRow>
                )}
                {!loadingLeaveTypes && leaveTypes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="p-6 text-center text-sm text-muted-foreground">
                      No leave types available.
                    </TableCell>
                  </TableRow>
                )}
                {leaveTypes.map((leaveType) => (
                  <TableRow key={String(leaveType.id)}>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{leaveType.name}</p>
                        <p className="text-sm text-muted-foreground">Code: {leaveType.code}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">{formatDays(leaveType.maxDaysPerYear)} days</Badge>
                        <Badge variant={leaveType.isPaid ? "default" : "outline"}>
                          {leaveType.isPaid ? "Paid" : "Unpaid"}
                        </Badge>
                        <Badge variant={leaveType.isActive ? "default" : "outline"}>
                          {leaveType.isActive ? "Active" : "Inactive"}
                        </Badge>
                        {leaveType.requiresMedicalCertificate ? (
                          <Badge variant="outline">Medical required</Badge>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="space-x-2 text-right">
                      {canUpdateType && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTypeEdit(leaveType)}
                        >
                          <Edit3 className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      )}
                      {canDeleteType && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={deletingLeaveType}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete leave type</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently remove <strong>{leaveType.name}</strong>. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleTypeDelete(leaveType)} disabled={deletingLeaveType}>
                              {deletingLeaveType ? "Deleting..." : "Delete"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Employee leave balances</CardTitle>
          <CardDescription>
            View and adjust leave balances with the HRMS leave balances API.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <form className="space-y-4" onSubmit={handleAdjustSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="employee">Employee</Label>
                <select
                  id="employee"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  value={selectedEmployeeId}
                  onChange={(event) => setSelectedEmployeeId(event.target.value)}
                >
                  {employees.map((employee) => (
                    <option key={String(employee.id)} value={String(employee.id)}>
                      {employee.fullName || employee.firstName || employee.email || "Employee"}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="school-year">School year</Label>
                <select
                  id="school-year"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  value={selectedSchoolYear}
                  onChange={(event) => setSelectedSchoolYear(event.target.value)}
                  disabled={loadingSchoolYears}
                >
                  {!loadingSchoolYears && schoolYears.length === 0 ? (
                    <option value="">No school years available</option>
                  ) : null}
                  {schoolYears.map((schoolYear) => (
                    <option key={String(schoolYear.id)} value={String(schoolYear.id)}>
                      {schoolYear.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="leave-type">Leave type</Label>
                <select
                  id="leave-type"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  value={adjustForm.leaveTypeId}
                  onChange={(event) =>
                    setAdjustForm((current) => ({
                      ...current,
                      leaveTypeId: event.target.value,
                    }))
                  }
                >
                  {leaveTypes.map((leaveType) => (
                    <option key={String(leaveType.id)} value={String(leaveType.id)}>
                      {leaveType.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="adjust-days">Total days</Label>
                <Input
                  id="adjust-days"
                  type="number"
                  value={adjustForm.totalDays}
                  onChange={(event) =>
                    setAdjustForm((current) => ({
                      ...current,
                      totalDays: event.target.value,
                    }))
                  }
                  placeholder="20"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="adjust-reason">Reason</Label>
                <Input
                  id="adjust-reason"
                  value={adjustForm.reason}
                  onChange={(event) =>
                    setAdjustForm((current) => ({ ...current, reason: event.target.value }))
                  }
                  placeholder="Balance adjustment reason"
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {canAdjustBalance && (
                <Button type="submit" disabled={adjustingBalance || !selectedEmployeeId}>
                  {adjustingBalance ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Adjust balance
                </Button>
              )}
            </div>
          </form>

          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingBalances && (
                  <TableRow>
                    <TableCell colSpan={4} className="p-6 text-center">
                      <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading balances...
                      </span>
                    </TableCell>
                  </TableRow>
                )}
                {!loadingBalances && leaveBalances?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="p-6 text-center text-sm text-muted-foreground">
                      No leave balances found for {selectedEmployee?.firstName ?? "selected employee"}.
                    </TableCell>
                  </TableRow>
                )}
                {leaveBalances?.map((balance) => (
                  <TableRow key={`${balance.leaveTypeId}-${balance.leaveTypeCode}`}>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{selectedEmployee?.firstName ?? "Employee"}</p>
                        <p className="text-sm text-muted-foreground">{selectedSchoolYear}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{balance.leaveTypeName}</p>
                        <p className="text-sm text-muted-foreground">{balance.leaveTypeCode}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        <p>Allocated: {formatDays(balance.totalDays)}</p>
                        <p>Used: {formatDays(balance.usedDays)}</p>
                        <p>Pending: {formatDays(balance.pendingDays)}</p>
                        <p>Remaining: {formatDays(balance.remainingDays)}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary">{balance.remainingDays && Number(balance.remainingDays) <= 0 ? "Exhausted" : "Available"}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {employeesError || leaveBalancesError ? (
            <ApiErrorView error={(employeesError ?? leaveBalancesError)!} fullScreen />
          ) : null}
        </CardContent>
      </Card>
    </div>
    </PermissionGuard>
  )
}
