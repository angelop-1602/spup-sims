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
import { ApiErrorView } from "@/components/ui/api-error-view"
import { TableTemplate } from "@/components/custom/table-template"
import { TableSkeletonRows } from "@/components/ui/table-skeleton-rows"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Edit3, Loader2, Plus, Save, Trash2 } from "lucide-react"
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"

type LeaveType = components["schemas"]["LeaveTypeResponse"]
type LeaveBalance = components["schemas"]["LeaveBalanceResponse"]
type Employee = components["schemas"]["EmployeeResponse"]
type PagedEmployees = components["schemas"]["PagedResponseOfEmployeeResponse"]
type SchoolYear = components["schemas"]["SchoolYearResponse"]
type PagedSchoolYears = components["schemas"]["PagedResponseOfSchoolYearResponse"]

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

function isMaternityLeaveType(leaveType: Pick<LeaveType, "name" | "code"> | null | undefined) {
  const haystack = `${leaveType?.name ?? ""} ${leaveType?.code ?? ""}`.toLowerCase()
  return haystack.includes("maternity")
}

function isPaternityLeaveType(leaveType: Pick<LeaveType, "name" | "code"> | null | undefined) {
  const haystack = `${leaveType?.name ?? ""} ${leaveType?.code ?? ""}`.toLowerCase()
  return haystack.includes("paternity")
}

function isEligibleForMaternityLeave(employee: Employee | null | undefined) {
  const record = (employee as Record<string, unknown> | undefined) ?? {}
  const genderValue = record.gender
  const civilStatusValue = record.civilStatus

  const numericGender = Number(genderValue)
  const numericCivilStatus = Number(civilStatusValue)

  const isFemale = numericGender === 1 || String(genderValue ?? "").trim().toLowerCase() === "female"
  const isMarried = numericCivilStatus === 2 || String(civilStatusValue ?? "").trim().toLowerCase() === "married"

  return isFemale && isMarried
}

function isEligibleForPaternityLeave(employee: Employee | null | undefined) {
  const record = (employee as Record<string, unknown> | undefined) ?? {}
  const genderValue = record.gender
  const civilStatusValue = record.civilStatus

  const numericGender = Number(genderValue)
  const numericCivilStatus = Number(civilStatusValue)

  const isMale = numericGender === 2 || String(genderValue ?? "").trim().toLowerCase() === "male"
  const isMarried = numericCivilStatus === 2 || String(civilStatusValue ?? "").trim().toLowerCase() === "married"

  return isMale && isMarried
}

function isEligibleForLeaveType(employee: Employee | null | undefined, leaveType: LeaveType | null | undefined) {
  if (isMaternityLeaveType(leaveType)) {
    return isEligibleForMaternityLeave(employee)
  }

  if (isPaternityLeaveType(leaveType)) {
    return isEligibleForPaternityLeave(employee)
  }

  return true
}

export default function LeaveSettingsClient() {
  const { hasPermission } = useHrmAuth()

  const canCreateType = hasPermission("hrms.leaveTypes.create")
  const canUpdateType = hasPermission("hrms.leaveTypes.update")
  const canDeleteType = hasPermission("hrms.leaveTypes.delete")
  const canAdjustBalance = hasPermission("hrms.leaveBalances.update")
  const canCreateSchoolYear = hasPermission("academic.schoolYears.create")

  const [isSchoolYearDialogOpen, setIsSchoolYearDialogOpen] = React.useState(false)
  const [schoolYearForm, setSchoolYearForm] = React.useState({
    name: "",
    startDate: "",
    endDate: "",
    isActive: false,
  })
  const [schoolYearError, setSchoolYearError] = React.useState<string | null>(null)

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
  const [employeeSearchText, setEmployeeSearchText] = React.useState("")
  const [balanceActionMessage, setBalanceActionMessage] = React.useState<string | null>(null)
  const [overridePreviousInitializations, setOverridePreviousInitializations] = React.useState(false)
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
    error: employeesError,
  } = useApiQuery<PagedEmployees>("/api/v1/hrms/employees", {
    Page: 1,
    PageSize: 100,
  })

  const employees = React.useMemo(() => employeesPaged?.data ?? [], [employeesPaged])

  const {
    data: currentSchoolYear,
    loading: loadingCurrentSchoolYear,
  } = useApiQuery<SchoolYear>("/api/v1/academic/school-years/current")

  const { data: schoolYearsPaged, refresh: refreshSchoolYears } = useApiQuery<PagedSchoolYears>("/api/v1/academic/school-years", {
    Page: 1,
    PageSize: 100,
    SortBy: "startDate",
    Descending: false,
  })

  const schoolYears = React.useMemo(() => schoolYearsPaged?.data ?? [], [schoolYearsPaged])
  const activeSchoolYear = schoolYears.find((schoolYear) => schoolYear.isActive) ?? schoolYears[0]
  const effectiveEmployeeId = selectedEmployeeId || String(employees[0]?.id ?? "")
  const selectedSchoolYear = String(currentSchoolYear?.id ?? activeSchoolYear?.id ?? "")
  const selectedLeaveTypeId = adjustForm.leaveTypeId || String(leaveTypes[0]?.id ?? "")

  const leaveBalancesPath = effectiveEmployeeId
    ? `/api/v1/hrms/leave-balances/employee/${effectiveEmployeeId}/school-year/${selectedSchoolYear}`
    : undefined

  const {
    data: leaveBalances,
    loading: loadingBalances,
    refresh: refreshLeaveBalances,
    error: leaveBalancesError,
  } = useApiQuery<LeaveBalance[]>(leaveBalancesPath, undefined, {
    enabled: Boolean(effectiveEmployeeId && selectedSchoolYear),
  })

  const { mutate: saveLeaveType, loading: savingLeaveType } = useApiMutation()
  const { mutate: deleteLeaveType, loading: deletingLeaveType } = useApiMutation()
  const { mutate: adjustLeaveBalance, loading: adjustingBalance } = useApiMutation()
  const { mutate: initializeLeaveBalances, loading: initializingBalances } = useApiMutation()
  const { mutate: createSchoolYear, loading: savingSchoolYear } = useApiMutation()

  const resetSchoolYearForm = () => {
    setSchoolYearForm({ name: "", startDate: "", endDate: "", isActive: false })
    setSchoolYearError(null)
  }

  const handleSchoolYearSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSchoolYearError(null)

    const ok = await createSchoolYear({
      path: "/api/v1/academic/school-years",
      method: "POST",
      body: {
        name: schoolYearForm.name,
        startDate: schoolYearForm.startDate,
        endDate: schoolYearForm.endDate,
        isActive: schoolYearForm.isActive,
      },
    })

    if (!ok) {
      setSchoolYearError("Unable to create school year")
      return
    }

    await refreshSchoolYears()
    resetSchoolYearForm()
    setIsSchoolYearDialogOpen(false)
  }

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

    if (!effectiveEmployeeId || !selectedLeaveTypeId || !adjustForm.reason.trim()) {
      return
    }

    const selectedLeaveType = leaveTypes.find(
      (leaveType) => String(leaveType.id) === selectedLeaveTypeId,
    )

    if (selectedLeaveType && !isEligibleForLeaveType(selectedEmployee, selectedLeaveType)) {
      const eligibilityMessage = isMaternityLeaveType(selectedLeaveType)
        ? "Maternity leave is only available for female, married employees."
        : isPaternityLeaveType(selectedLeaveType)
          ? "Paternity leave is only available for male, married employees."
          : "This leave type is not available for the selected employee."

      setBalanceActionMessage(eligibilityMessage)
      return
    }

    const success = await adjustLeaveBalance({
      path: "/api/v1/hrms/leave-balances/adjust",
      method: "POST",
      body: {
        employeeId: Number(effectiveEmployeeId),
        leaveTypeId: Number(selectedLeaveTypeId),
        schoolYearId: Number(selectedSchoolYear),
        totalDays: Number(adjustForm.totalDays) || undefined,
        reason: adjustForm.reason.trim(),
      },
    })

    if (success) {
      await refreshLeaveBalances()
      setAdjustForm((current) => ({ ...current, totalDays: "" }))
      setBalanceActionMessage("Leave balance adjusted successfully.")
    }
  }

  const selectedEmployee = employees.find(
    (employee) => String(employee.id) === effectiveEmployeeId,
  )

  const filteredEmployees = React.useMemo(() => {
    const searchText = employeeSearchText.trim().toLowerCase()
    if (!searchText) {
      return employees
    }

    return employees.filter((employee) => {
      const label = `${employee.fullName || ""} ${employee.firstName || ""} ${employee.lastName || ""} ${employee.email || ""}`.toLowerCase()
      return label.includes(searchText)
    })
  }, [employeeSearchText, employees])

  const selectedSchoolYearName = React.useMemo(() => {
    if (currentSchoolYear?.name) {
      return currentSchoolYear.name
    }

    if (selectedSchoolYear) {
      return schoolYears.find((schoolYear) => String(schoolYear.id) === selectedSchoolYear)?.name ?? selectedSchoolYear
    }

    return "Current school year"
  }, [currentSchoolYear, schoolYears, selectedSchoolYear])

  const selectedLeaveType = React.useMemo(
    () => leaveTypes.find((leaveType) => String(leaveType.id) === selectedLeaveTypeId) ?? null,
    [leaveTypes, selectedLeaveTypeId],
  )

  const handleInitializeBalances = async () => {
    if (!selectedSchoolYear) {
      setBalanceActionMessage("No current school year is available yet.")
      return
    }

    const activeLeaveTypes = leaveTypes.filter((leaveType) => Boolean(leaveType.isActive))
    const specialLeaveTypes = activeLeaveTypes.filter(
      (leaveType) => isMaternityLeaveType(leaveType) || isPaternityLeaveType(leaveType),
    )
    const regularLeaveTypes = activeLeaveTypes.filter(
      (leaveType) => !isMaternityLeaveType(leaveType) && !isPaternityLeaveType(leaveType),
    )

    const leaveTypeDefaults = regularLeaveTypes.reduce<Record<string, number | string>>(
      (accumulator, leaveType) => {
        const days = Number(leaveType.maxDaysPerYear ?? 0)
        if (leaveType.id && Number.isFinite(days) && days >= 0) {
          accumulator[String(leaveType.id)] = days
        }
        return accumulator
      },
      {},
    )

    if (Object.keys(leaveTypeDefaults).length === 0 && specialLeaveTypes.length === 0) {
      setBalanceActionMessage("No active leave types are available to initialize.")
      return
    }

    const initializeSuccess = await initializeLeaveBalances({
      path: "/api/v1/hrms/leave-balances/initialize",
      method: "POST",
      body: {
        schoolYearId: Number(selectedSchoolYear),
        leaveTypeDefaults,
      },
    })

    if (!initializeSuccess) {
      setBalanceActionMessage("Unable to initialize default leave balances.")
      return
    }

    if (overridePreviousInitializations) {
      for (const leaveType of specialLeaveTypes) {
        for (const employee of employees) {
          await adjustLeaveBalance({
            path: "/api/v1/hrms/leave-balances/adjust",
            method: "POST",
            body: {
              employeeId: Number(employee.id),
              leaveTypeId: Number(leaveType.id),
              schoolYearId: Number(selectedSchoolYear),
              totalDays: 0,
              reason: `Override previous ${leaveType.name ?? "leave"} initialization`,
            },
          })
        }
      }
    }

    for (const leaveType of specialLeaveTypes) {
      const eligibleEmployees = employees.filter((employee) => isEligibleForLeaveType(employee, leaveType))
      if (!eligibleEmployees.length) {
        continue
      }

      const days = Number(leaveType.maxDaysPerYear ?? 0)
      for (const employee of eligibleEmployees) {
        await adjustLeaveBalance({
          path: "/api/v1/hrms/leave-balances/adjust",
          method: "POST",
          body: {
            employeeId: Number(employee.id),
            leaveTypeId: Number(leaveType.id),
            schoolYearId: Number(selectedSchoolYear),
            totalDays: Number.isFinite(days) && days >= 0 ? days : undefined,
            reason: `Initial ${leaveType.name ?? "leave"} allocation`,
          },
        })
      }
    }

    await refreshLeaveBalances()
    setBalanceActionMessage(
      specialLeaveTypes.length > 0
        ? `Leave balances initialized for ${selectedSchoolYearName}. Special leave was applied only to eligible employees.`
        : `Leave balances initialized for ${selectedSchoolYearName}.`,
    )
  }

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
                {isMaternityLeaveType({ name: typeForm.name, code: typeForm.code }) ? (
                  <p className="text-sm text-muted-foreground">
                    Maternity leave is only applicable to female, married employees.
                  </p>
                ) : null}
                {isPaternityLeaveType({ name: typeForm.name, code: typeForm.code }) ? (
                  <p className="text-sm text-muted-foreground">
                    Paternity leave is only applicable to male, married employees.
                  </p>
                ) : null}
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

          <TableTemplate label="Leave types table">
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
                  <TableSkeletonRows columns={3} rows={6} />
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
                        {isMaternityLeaveType(leaveType) ? (
                          <Badge variant="outline">Female + married only</Badge>
                        ) : null}
                        {isPaternityLeaveType(leaveType) ? (
                          <Badge variant="outline">Male + married only</Badge>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="space-x-2 text-right">
                      {canUpdateType && (
                        <Button
                          variant="outline"
                          size="icon-sm"
                          onClick={() => handleTypeEdit(leaveType)}
                          aria-label={`Edit ${leaveType.name}`}
                        >
                          <Edit3 aria-hidden="true" className="h-4 w-4" />
                        </Button>
                      )}
                      {canDeleteType && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="icon-sm"
                            disabled={deletingLeaveType}
                            aria-label={`Delete ${leaveType.name}`}
                          >
                            <Trash2 aria-hidden="true" className="h-4 w-4" />
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
          </TableTemplate>
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
                <Combobox
                  value={effectiveEmployeeId}
                  onValueChange={(value) => {
                    const nextValue = value ?? ""
                    setSelectedEmployeeId(nextValue)
                    if (nextValue) {
                      const employee = employees.find((item) => String(item.id) === nextValue)
                      setEmployeeSearchText(
                        employee?.fullName || employee?.firstName || employee?.email || "",
                      )
                    }
                  }}
                >
                  <ComboboxInput
                    id="employee"
                    value={employeeSearchText}
                    onChange={(event) => setEmployeeSearchText(event.target.value)}
                    placeholder="Search employee"
                    showTrigger
                    showClear
                  />
                  <ComboboxContent>
                    <ComboboxList>
                      {filteredEmployees.map((employee) => {
                        const label = employee.fullName || employee.firstName || employee.email || "Employee"
                        return (
                          <ComboboxItem key={String(employee.id)} value={String(employee.id)}>
                            {label}
                          </ComboboxItem>
                        )
                      })}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="school-year">School year</Label>
                  {canCreateSchoolYear && (
                    <Dialog
                      open={isSchoolYearDialogOpen}
                      onOpenChange={(open) => { setIsSchoolYearDialogOpen(open); if (!open) resetSchoolYearForm() }}
                    >
                      <DialogTrigger asChild>
                        <Button type="button" variant="ghost" size="sm">
                          <Plus className="mr-1 h-3.5 w-3.5" />
                          New
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>New school year</DialogTitle>
                          <DialogDescription>Add a school year record.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSchoolYearSubmit} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="school-year-name">Name</Label>
                            <Input
                              id="school-year-name"
                              value={schoolYearForm.name}
                              onChange={(e) => setSchoolYearForm((s) => ({ ...s, name: e.target.value }))}
                              placeholder="2026-2027"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="school-year-start">Start date</Label>
                            <Input
                              id="school-year-start"
                              type="date"
                              value={schoolYearForm.startDate}
                              onChange={(e) => setSchoolYearForm((s) => ({ ...s, startDate: e.target.value }))}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="school-year-end">End date</Label>
                            <Input
                              id="school-year-end"
                              type="date"
                              value={schoolYearForm.endDate}
                              onChange={(e) => setSchoolYearForm((s) => ({ ...s, endDate: e.target.value }))}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="school-year-active">Status</Label>
                            <Select
                              value={String(schoolYearForm.isActive)}
                              onValueChange={(value) => setSchoolYearForm((s) => ({ ...s, isActive: value === "true" }))}
                            >
                              <SelectTrigger id="school-year-active">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="true">Active</SelectItem>
                                <SelectItem value="false">Inactive</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {schoolYearError && (
                            <p className="text-sm text-destructive">{schoolYearError}</p>
                          )}
                          <DialogFooter>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => { resetSchoolYearForm(); setIsSchoolYearDialogOpen(false) }}
                            >
                              Cancel
                            </Button>
                            <Button type="submit" disabled={savingSchoolYear}>
                              {savingSchoolYear ? "Saving..." : "Save school year"}
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
                <Input
                  id="school-year"
                  value={loadingCurrentSchoolYear ? "Loading current school year..." : selectedSchoolYearName}
                  readOnly
                  className="bg-muted/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="leave-type">Leave type</Label>
                <select
                  id="leave-type"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  value={selectedLeaveTypeId}
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
                {selectedLeaveType && isMaternityLeaveType(selectedLeaveType) ? (
                  <p className="text-sm text-muted-foreground">
                    Maternity leave is only applicable to female, married employees.
                  </p>
                ) : null}
                {selectedLeaveType && isPaternityLeaveType(selectedLeaveType) ? (
                  <p className="text-sm text-muted-foreground">
                    Paternity leave is only applicable to male, married employees.
                  </p>
                ) : null}
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
                <div className="flex items-center gap-2 rounded-md border border-input px-3 py-2 text-sm">
                  <input
                    id="override-previous-initializations"
                    type="checkbox"
                    checked={overridePreviousInitializations}
                    onChange={(event) => setOverridePreviousInitializations(event.target.checked)}
                  />
                  <Label htmlFor="override-previous-initializations">Override previous initializations</Label>
                </div>
              )}
              {canAdjustBalance && (
                <Button type="button" variant="secondary" onClick={handleInitializeBalances} disabled={initializingBalances || !selectedSchoolYear || leaveTypes.length === 0}>
                  {initializingBalances ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="mr-2 h-4 w-4" />
                  )}
                  Initialize balances for all employees
                </Button>
              )}
              {canAdjustBalance && (
                <Button type="submit" disabled={adjustingBalance || !effectiveEmployeeId}>
                  {adjustingBalance ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Adjust balance
                </Button>
              )}
            </div>
            {balanceActionMessage ? (
              <p className="text-sm text-muted-foreground">{balanceActionMessage}</p>
            ) : null}
          </form>

          <TableTemplate label="Employee leave balances table">
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
                  <TableSkeletonRows columns={4} rows={6} />
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
                        <p className="text-sm text-muted-foreground">{selectedSchoolYearName}</p>
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
          </TableTemplate>
          {employeesError || leaveBalancesError ? (
            <ApiErrorView error={(employeesError ?? leaveBalancesError)!} fullScreen />
          ) : null}
        </CardContent>
      </Card>
    </div>
    </PermissionGuard>
  )
}
