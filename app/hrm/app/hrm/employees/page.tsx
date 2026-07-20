"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Users, Eye, Edit3, Trash2, UserPlus, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PermissionGuard } from "@/components/auth/permission-guard"
import { useHrmAuth } from "@/components/auth/hrm-auth-guard"
import { TableRowActions } from "@/components/custom/table-row-actions"
import { TableTemplate } from "@/components/custom/table-template"
import {
  useApiQuery,
  useApiMutation,
  type EmployeeResponse,
  type PagedResponseOfEmployeeResponse,
  type CreateEmployeeRequest,
  type UpdateEmployeeRequest,
  type PagedResponseOfDepartmentResponse,
  type PagedResponseOfPositionResponse,
  type PagedResponseOfEmployeeTypeResponse,
  type SchoolYearResponse,
  type PagedResponseOfEmployeeSchoolYearAssignmentResponse,
  type PagedResponseOfRoleResponse,
} from "@/lib/api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Employee = EmployeeResponse
type PagedEmployees = PagedResponseOfEmployeeResponse
type CreateEmployeeRequestWithDeps = CreateEmployeeRequest & {
  departmentId: number | string
  positionId: number | string
}
type UpdateEmployeeRequestWithDeps = UpdateEmployeeRequest & {
  departmentId: number | string
  positionId: number | string
}

const PAGE_SIZE = 10

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

/** An employee has an empty portfolio when all personal detail fields are unfilled. */
function isPortfolioEmpty(employee: Employee): boolean {
  return (
    !employee.mobileNumber &&
    !employee.phoneNumber &&
    employee.age == null &&
    !employee.religion
  )
}

type EmployeeForm = {
  firstName: string
  lastName: string
  email: string
  employeeNumber: string
  departmentId: number | string | null
  positionId: number | string | null
  employeeTypeId: number | string | null
  dateHired: string
  // Only applied on create: the backend auto-creates a login User for @spup.edu.ph
  // emails and assigns this role to it. Ignored on update, and ignored entirely if
  // the email isn't institutional (no User gets created in that case).
  roleId: number | string | null
}

const EMPTY_FORM: EmployeeForm = {
  firstName: "",
  lastName: "",
  email: "",
  employeeNumber: "",
  departmentId: null,
  positionId: null,
  employeeTypeId: null,
  dateHired: "",
  roleId: null,
}

function toCreateRequest(form: EmployeeForm): CreateEmployeeRequestWithDeps {
  return {
    employeeNumber: form.employeeNumber,
    profile: {
      firstName: form.firstName,
      lastName: form.lastName,
      personalEmail: form.email,
    },
    departmentId: Number(form.departmentId),
    positionId: Number(form.positionId),
    employeeTypeId: Number(form.employeeTypeId),
    dateHired: form.dateHired,
    roleId: form.roleId ? Number(form.roleId) : null,
  }
}

/** PUT carries the same required fields as create, plus whatever the existing
 * record already has for fields the form doesn't expose — otherwise saving
 * would silently reset them to their schema defaults (e.g. employment status
 * back to Active, isActive back to true). This also applies to `profile`: if the
 * caller holds core.profiles.update, the backend writes every field in that object
 * unconditionally, so fields this form never shows (middleName, gender, birthDate,
 * etc.) must be carried through from `existing` or they'd get wiped on save. */
function toUpdateRequest(form: EmployeeForm, existing: Employee): UpdateEmployeeRequestWithDeps {
  return {
    employeeNumber: form.employeeNumber,
    profile: {
      firstName: form.firstName,
      middleName: existing.middleName ?? null,
      lastName: form.lastName,
      suffix: existing.suffix ?? null,
      gender: existing.gender ?? null,
      civilStatus: existing.civilStatus ?? null,
      personalEmail: form.email,
      mobileNumber: existing.mobileNumber ?? null,
      phoneNumber: existing.phoneNumber ?? null,
      birthDate: existing.birthDate ?? null,
      age: existing.age ?? null,
      religion: existing.religion ?? null,
      qualifier: existing.qualifier ?? null,
      profilePicture: existing.profilePicture ?? null,
    },
    departmentId: Number(form.departmentId),
    positionId: Number(form.positionId),
    employeeTypeId: Number(form.employeeTypeId),
    dateHired: form.dateHired,
    employmentStatus: existing.employmentStatus,
    employmentCategory: existing.employmentCategory,
    shared: existing.shared ?? false,
    dateRegularized: existing.dateRegularized ?? null,
    dateSeparated: existing.dateSeparated ?? null,
    isActive: existing.isActive ?? true,
  }
}

export default function EmployeesPage() {
  const router = useRouter()
  const { hasPermission } = useHrmAuth()

  const canCreate = hasPermission("hrms.employees.create")
  // canManageOthers gates edit/delete on the employee list — only HR-level roles
  // that can also create employees should manage other employees. Self-service
  // roles (Employee, Faculty, DepartmentHead) have hrms.employees.update only
  // for their own profile via the portfolio page, not for the employee list.
  const canManageOthers = hasPermission("hrms.employees.create")
  const canDelete = hasPermission("hrms.employees.delete")
  // Editing an existing employee's personal/profile fields (name, email, etc.) requires
  // core.profiles.update — HR roles without it can only edit employment details (department,
  // position, type, dates, status). The backend silently ignores profile field changes from
  // callers lacking this permission, so the form must not present them as editable either.
  const canEditProfile = hasPermission("core.profiles.update")
  // Shown only on the create form — lets HR pick a role for the login User the
  // backend auto-creates when the new employee's email is institutional. Gated by
  // the same permission that lets the identity/roles list endpoint be called.
  const canAssignRole = hasPermission("identity.roles.view")
  // Department Head is the only role with hrms.employees.view but not .create —
  // restrict them to the roster of the department they currently head. Headship
  // is scoped per school year (EmployeeSchoolYearAssignmentResponse.isDepartmentHead),
  // not a static field on the employee record, so it's resolved via that assignment
  // rather than assumed to be the viewer's own home department.
  const isDepartmentScoped = !canManageOthers

  const { data: ownProfile } = useApiQuery<EmployeeResponse>(
    isDepartmentScoped ? "/api/v1/hrms/me/profile" : null,
  )
  const { data: currentSchoolYear } = useApiQuery<SchoolYearResponse>(
    isDepartmentScoped ? "/api/v1/academic/school-years/current" : null,
  )
  const { data: ownHeadAssignmentData } = useApiQuery<PagedResponseOfEmployeeSchoolYearAssignmentResponse>(
    "/api/v1/hrms/employee-school-years",
    {
      EmployeeId: ownProfile?.id,
      SchoolYearId: currentSchoolYear?.id,
      IsDepartmentHead: true,
      Page: 1,
      PageSize: 1,
    },
    { enabled: isDepartmentScoped && Boolean(ownProfile?.id) && Boolean(currentSchoolYear?.id) },
  )
  const headedDepartmentId = ownHeadAssignmentData?.data?.[0]?.departmentId ?? null

  // Search and filters
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [page, setPage] = useState(1)

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [employeePendingDelete, setEmployeePendingDelete] = useState<Employee | null>(null)
  const [formState, setFormState] = useState<EmployeeForm>(EMPTY_FORM)
  const [formError, setFormError] = useState<string | null>(null)

  // Invite state — track which employee id is being sent, and success set
  const [invitingId, setInvitingId] = useState<number | string | null>(null)
  const [invitedIds, setInvitedIds] = useState<Set<number | string>>(new Set())
  const [inviteError, setInviteError] = useState<string | null>(null)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(1)
    }, 200)
    return () => clearTimeout(timeout)
  }, [search])

  const {
    data: employeesPaged,
    loading,
    error,
    refresh,
  } = useApiQuery<PagedEmployees>(
    "/api/v1/hrms/employees",
    {
      Page: page,
      PageSize: PAGE_SIZE,
      Search: debouncedSearch || undefined,
      DepartmentId: isDepartmentScoped ? headedDepartmentId ?? undefined : undefined,
    },
    { enabled: !isDepartmentScoped || Boolean(headedDepartmentId) },
  )

  const { mutate: saveEmployee, loading: saving } = useApiMutation()
  const { mutate: deleteEmployee, loading: deleting } = useApiMutation()
  const { mutate: sendInvite } = useApiMutation()

  // Fetch departments for dropdown
  const { data: departmentsData } = useApiQuery<PagedResponseOfDepartmentResponse>(
    "/api/v1/organization/departments",
    { Page: 1, PageSize: 500, SortBy: "id" },
  )
  const departments = departmentsData?.data ?? []

  // Fetch positions for dropdown
  const { data: positionsData } = useApiQuery<PagedResponseOfPositionResponse>(
    "/api/v1/organization/positions",
    { Page: 1, PageSize: 500, SortBy: "id" },
  )
  const positions = positionsData?.data ?? []

  // Fetch employee types for dropdown
  const { data: employeeTypesData } = useApiQuery<PagedResponseOfEmployeeTypeResponse>(
    "/api/v1/hrms/employee-types",
    { Page: 1, PageSize: 500, SortBy: "id" },
  )
  const employeeTypes = employeeTypesData?.data ?? []

  // Fetch roles for the create form's role picker
  const { data: rolesData } = useApiQuery<PagedResponseOfRoleResponse>(
    canAssignRole ? "/api/v1/identity/roles" : null,
    { Page: 1, PageSize: 100, SortBy: "id" },
  )
  const roles = (rolesData?.data ?? []).filter((role) => role.isActive !== false)

  const employees = employeesPaged?.data ?? []
  const totalPages = Number(employeesPaged?.totalPages ?? 1)
  const totalRecords = employeesPaged?.totalRecords ?? 0
  const hasActiveFilters = Boolean(search)

  function openCreateDialog() {
    setSelectedEmployee(null)
    setFormState(EMPTY_FORM)
    setFormError(null)
    setIsDialogOpen(true)
  }

  function openEditDialog(employee: Employee) {
    setSelectedEmployee(employee)
    setFormState({
      firstName: employee.firstName ?? "",
      lastName: employee.lastName ?? "",
      email: employee.email ?? "",
      employeeNumber: employee.employeeNumber ?? "",
      departmentId: employee.departmentId ?? null,
      positionId: employee.positionId ?? null,
      employeeTypeId: employee.employeeTypeId ?? null,
      dateHired: employee.dateHired ?? "",
      roleId: null,
    })
    setFormError(null)
    setIsDialogOpen(true)
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)

    const path = selectedEmployee
      ? `/api/v1/hrms/employees/${selectedEmployee.id}`
      : "/api/v1/hrms/employees"
    const method = selectedEmployee ? "PUT" : "POST"

    const body = selectedEmployee ? toUpdateRequest(formState, selectedEmployee) : toCreateRequest(formState)
    const ok = await saveEmployee({ path, method, body })
    if (!ok) {
      setFormError("Unable to save employee.")
      return
    }

    await refresh()
    setIsDialogOpen(false)
  }

  async function handleDelete(employee: Employee) {
    const ok = await deleteEmployee({
      path: `/api/v1/hrms/employees/${employee.id}`,
      method: "DELETE",
    })
    if (ok) {
      await refresh()
      setEmployeePendingDelete(null)
    }
  }

  async function handleSendInvite(employee: Employee) {
    setInviteError(null)
    setInvitingId(employee.id)
    const ok = await sendInvite({
      path: "/api/v1/hrms/azure/invitations/send",
      method: "POST",
      body: { employeeIds: [employee.id] },
    })
    setInvitingId(null)
    if (!ok) {
      setInviteError(`Failed to send invitation to ${employee.fullName}.`)
      return
    }
    setInvitedIds((prev) => new Set(prev).add(employee.id))
  }

  return (
    <PermissionGuard requiredPermission="hrms.employees.view">

        <TableTemplate
          label="Employees table"
          className="mt-4"
          search={{
            value: search,
            onChange: setSearch,
            onClear: () => {
              setSearch("")
              setPage(1)
            },
            placeholder: "Search employees by name",
            label: "Search employees",
          }}
          actions={
            canCreate ? (
              <Button onClick={openCreateDialog}>
                <UserPlus className="mr-2 h-4 w-4" />
                New employee
              </Button>
            ) : undefined
          }
          hasActiveFilters={hasActiveFilters}
          onClearFilters={() => {
            setSearch("")
            setPage(1)
          }}
          loading={loading}
          loadingLabel="Loading employees"
          loadingSkeleton={{ columns: 6, rows: 8 }}
          error={error}
          onRetry={refresh}
          empty={employees.length === 0}
          emptyState={
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <Users className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium">
                {isDepartmentScoped && !headedDepartmentId
                  ? "You're not currently assigned as head of a department"
                  : hasActiveFilters
                    ? "No employees match your filters"
                    : "No employees yet"}
              </p>
              <p className="text-sm text-muted-foreground">
                {isDepartmentScoped && !headedDepartmentId
                  ? "Once you're assigned as a department head for the current school year, its employees will show up here."
                  : hasActiveFilters
                    ? "Try a different name."
                    : "Employees you add will show up here."}
              </p>
            </div>
          }
          pagination={
            !loading && !error && employees.length > 0
              ? {
                  page,
                  pageSize: PAGE_SIZE,
                  totalPages,
                  totalRecords: Number(totalRecords),
                  itemLabel:
                    Number(totalRecords) === 1 ? "employee" : "employees",
                  onPageChange: setPage,
                }
              : undefined
          }
        >
          <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Employee</th>
                    <th className="px-4 py-3 font-medium">ID</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Department</th>
                    <th className="px-4 py-3 font-medium">Position</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee) => {
                    const emptyPortfolio = isPortfolioEmpty(employee)
                    const alreadyInvited = invitedIds.has(employee.id)
                    const isSending = invitingId === employee.id

                    return (
                      <tr key={employee.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                              {getInitials(employee.fullName ?? "")}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-medium">{employee.fullName}</p>
                              <p className="truncate text-xs text-muted-foreground">{employee.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{employee.employeeNumber}</td>
                        <td className="px-4 py-3">
                          {employee.employeeType ?? "-"}
                        </td>
                        <td className="px-4 py-3">
                          {employee.department ?? "-"}
                        </td>
                        <td className="px-4 py-3">
                          {employee.position ?? "-"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={
                              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium " +
                              (employee.isActive ? "bg-green-50 text-green-700" : "bg-zinc-100 text-zinc-600")
                            }
                          >
                            {employee.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <TableRowActions
                            label={`Actions for ${employee.fullName}`}
                            actions={[
                              {
                                label: "View portfolio",
                                icon: <Eye aria-hidden="true" className="h-4 w-4" />,
                                onSelect: () => router.push(`/hrm/portfolio/${employee.id}`),
                              },
                              ...(canManageOthers
                                ? [
                                    {
                                      label: "Edit employee",
                                      icon: <Edit3 aria-hidden="true" className="h-4 w-4" />,
                                      onSelect: () => openEditDialog(employee),
                                    },
                                  ]
                                : []),
                              ...(canManageOthers && emptyPortfolio
                                ? [
                                    {
                                      label: alreadyInvited
                                        ? "Invitation sent"
                                        : "Send portfolio invitation",
                                      icon: isSending ? (
                                        <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <Send
                                          aria-hidden="true"
                                          className={alreadyInvited ? "h-4 w-4 text-green-600" : "h-4 w-4"}
                                        />
                                      ),
                                      onSelect: () => handleSendInvite(employee),
                                      disabled: isSending || alreadyInvited,
                                    },
                                  ]
                                : []),
                              ...(canDelete
                                ? [
                                    {
                                      label: "Delete employee",
                                      icon: <Trash2 aria-hidden="true" className="h-4 w-4" />,
                                      onSelect: () => setEmployeePendingDelete(employee),
                                      variant: "destructive" as const,
                                    },
                                  ]
                                : []),
                            ]}
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
          </div>
        </TableTemplate>

        <AlertDialog
          open={Boolean(employeePendingDelete)}
          onOpenChange={(open) => {
            if (!open && !deleting) setEmployeePendingDelete(null)
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete employee</AlertDialogTitle>
              <AlertDialogDescription>
                This will archive <strong>{employeePendingDelete?.fullName}</strong>. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (employeePendingDelete) void handleDelete(employeePendingDelete)
                }}
                disabled={deleting}
              >
                {deleting ? "Deleting…" : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Create / Edit dialog */}
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setFormError(null) }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedEmployee ? "Edit employee" : "New employee"}</DialogTitle>
              <DialogDescription>
                {selectedEmployee && !canEditProfile
                  ? "You can update this employee's department, position, type, and dates. Personal details are managed by the employee or an administrator."
                  : "Fill in the employee details below. Department and Position are required."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              {(!selectedEmployee || canEditProfile) && (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="emp-first-name">First name</Label>
                      <Input
                        id="emp-first-name"
                        value={formState.firstName}
                        onChange={(e) => setFormState((s) => ({ ...s, firstName: e.target.value }))}
                        placeholder="Juan"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emp-last-name">Last name</Label>
                      <Input
                        id="emp-last-name"
                        value={formState.lastName}
                        onChange={(e) => setFormState((s) => ({ ...s, lastName: e.target.value }))}
                        placeholder="Dela Cruz"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emp-email">Personal email</Label>
                    <Input
                      id="emp-email"
                      type="email"
                      value={formState.email}
                      onChange={(e) => setFormState((s) => ({ ...s, email: e.target.value }))}
                      placeholder="juan@spup.edu.ph"
                      required
                    />
                  </div>
                </>
              )}
              {selectedEmployee && !canEditProfile && (
                <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm">
                  <p className="font-medium">{selectedEmployee.fullName}</p>
                  <p className="text-muted-foreground">{selectedEmployee.email}</p>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="emp-number">Employee number</Label>
                <Input
                  id="emp-number"
                  value={formState.employeeNumber}
                  onChange={(e) => setFormState((s) => ({ ...s, employeeNumber: e.target.value }))}
                  placeholder="EMP-0001"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="emp-department">Department <span className="text-destructive">*</span></Label>
                  <Select
                    value={String(formState.departmentId ?? "")}
                    onValueChange={(value) => setFormState((s) => ({ ...s, departmentId: value || null }))}
                  >
                    <SelectTrigger id="emp-department">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={String(dept.id)} value={String(dept.id)}>
                          {dept.name ?? ""} ({dept.code ?? ""})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emp-position">Position <span className="text-destructive">*</span></Label>
                  <Select
                    value={String(formState.positionId ?? "")}
                    onValueChange={(value) => setFormState((s) => ({ ...s, positionId: value || null }))}
                  >
                    <SelectTrigger id="emp-position">
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      {positions.map((pos) => (
                        <SelectItem key={String(pos.id)} value={String(pos.id)}>
                          {pos.name ?? ""} ({pos.code ?? ""})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="emp-type">Employee type <span className="text-destructive">*</span></Label>
                  <Select
                    value={String(formState.employeeTypeId ?? "")}
                    onValueChange={(value) => setFormState((s) => ({ ...s, employeeTypeId: value || null }))}
                  >
                    <SelectTrigger id="emp-type">
                      <SelectValue placeholder="Select employee type" />
                    </SelectTrigger>
                    <SelectContent>
                      {employeeTypes.map((type) => (
                        <SelectItem key={String(type.id)} value={String(type.id)}>
                          {type.name ?? ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emp-date-hired">Date hired <span className="text-destructive">*</span></Label>
                  <Input
                    id="emp-date-hired"
                    type="date"
                    value={formState.dateHired}
                    onChange={(e) => setFormState((s) => ({ ...s, dateHired: e.target.value }))}
                    required
                  />
                </div>
              </div>
              {!selectedEmployee && canAssignRole && (
                <div className="space-y-2">
                  <Label htmlFor="emp-role">Role</Label>
                  <Select
                    value={formState.roleId != null ? String(formState.roleId) : ""}
                    onValueChange={(value) => setFormState((s) => ({ ...s, roleId: value || null }))}
                  >
                    <SelectTrigger id="emp-role">
                      <SelectValue placeholder="No role (assign later)" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={String(role.id)} value={String(role.id)}>
                          {role.name ?? ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Only applies if the email above is an @spup.edu.ph address — that&apos;s
                    the only case a login account gets created automatically.
                  </p>
                </div>
              )}
              {formError && (
                <p className="text-sm text-destructive">{formError}</p>
              )}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving…" : selectedEmployee ? "Save changes" : "Create employee"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
    </PermissionGuard>
  )
}
