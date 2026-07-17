"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Search, Users, Eye, Edit3, Trash2, UserPlus, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PermissionGuard } from "@/components/auth/permission-guard"
import { useHrmAuth } from "@/components/auth/hrm-auth-guard"
import {
  useApiQuery,
  useApiMutation,
  type EmployeeResponse,
  type PagedResponseOfEmployeeResponse,
  type CreateEmployeeRequest,
  type DepartmentResponse,
  type PagedResponseOfDepartmentResponse,
  type PositionResponse,
  type PagedResponseOfPositionResponse,
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ApiErrorView } from "@/components/ui/api-error-view"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type Employee = EmployeeResponse
type PagedEmployees = PagedResponseOfEmployeeResponse
type CreateEmployeeRequestWithDeps = CreateEmployeeRequest & {
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
}

const EMPTY_FORM: EmployeeForm = {
  firstName: "",
  lastName: "",
  email: "",
  employeeNumber: "",
  departmentId: null,
  positionId: null,
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

  // Search and filters
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [page, setPage] = useState(1)

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
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
  } = useApiQuery<PagedEmployees>("/api/v1/hrms/employees", {
    Page: page,
    PageSize: PAGE_SIZE,
    Search: debouncedSearch || undefined,
  })

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
      departmentId: (employee as any).departmentId ?? null,
      positionId: (employee as any).positionId ?? null,
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

    const ok = await saveEmployee({ path, method, body: toCreateRequest(formState) })
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
    if (ok) await refresh()
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
      <div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-normal">Employees</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Employee details will appear below.
            </p>
          </div>
          {canCreate && (
            <Button onClick={openCreateDialog}>
              <UserPlus className="mr-2 h-4 w-4" />
              New employee
            </Button>
          )}
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employees by name"
              className="w-full rounded-md border border-input bg-background py-2 pl-8 pr-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => { setSearch(""); setPage(1) }}
              className="text-sm font-medium text-muted-foreground underline-offset-2 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>

        {inviteError && (
          <div className="mt-3 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {inviteError}
          </div>
        )}

        <div className="mt-4 overflow-hidden rounded-lg border">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading employees…
            </div>
          ) : error ? (
            <ApiErrorView error={error} onRetry={refresh} fullScreen />
          ) : employees.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <Users className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium">
                {hasActiveFilters ? "No employees match your filters" : "No employees yet"}
              </p>
              <p className="text-sm text-muted-foreground">
                {hasActiveFilters ? "Try a different name." : "Employees you add will show up here."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Employee</th>
                    <th className="px-4 py-3 font-medium">Employee ID</th>
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
                          {(employee as any).department ?? "-"}
                        </td>
                        <td className="px-4 py-3">
                          {(employee as any).position ?? "-"}
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
                          <div className="flex items-center justify-end gap-2">
                            {/* View */}
                            <Button
                              variant="outline"
                              size="icon-sm"
                              onClick={() => router.push(`/hrm/portfolio/${employee.id}`)}
                              aria-label="View portfolio"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {/* Edit — only HR-level users who can create employees */}
                            {canManageOthers && (
                              <Button
                                variant="outline"
                                size="icon-sm"
                                onClick={() => openEditDialog(employee)}
                                aria-label="Edit employee"
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                            )}
                            {/* Send invitation — only HR-level users, only when portfolio is empty */}
                            {canManageOthers && emptyPortfolio && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon-sm"
                                    onClick={() => handleSendInvite(employee)}
                                    disabled={isSending || alreadyInvited}
                                    aria-label="Send portfolio invitation"
                                  >
                                    {isSending ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Send className={alreadyInvited ? "h-4 w-4 text-green-600" : "h-4 w-4"} />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {alreadyInvited ? "Invitation sent" : "Send portfolio invitation"}
                                </TooltipContent>
                              </Tooltip>
                            )}
                            {/* Delete */}
                            {canDelete && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="icon-sm" aria-label="Delete employee">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete employee</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will archive <strong>{employee.fullName}</strong>. This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(employee)} disabled={deleting}>
                                      {deleting ? "Deleting…" : "Delete"}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {!loading && !error && employees.length > 0 && (
          <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages} · {totalRecords} employee{totalRecords === 1 ? "" : "s"}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-md border px-3 py-1.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50 hover:bg-muted/50"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="rounded-md border px-3 py-1.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50 hover:bg-muted/50"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Create / Edit dialog */}
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setFormError(null) }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedEmployee ? "Edit employee" : "New employee"}</DialogTitle>
              <DialogDescription>Fill in the employee details below. Department and Position are required.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
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
                <Label htmlFor="emp-email">Email</Label>
                <Input
                  id="emp-email"
                  type="email"
                  value={formState.email}
                  onChange={(e) => setFormState((s) => ({ ...s, email: e.target.value }))}
                  placeholder="juan@spup.edu.ph"
                  required
                />
              </div>
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
                          {pos.title ?? ""} ({pos.code ?? ""})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
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
      </div>
    </PermissionGuard>
  )
}
