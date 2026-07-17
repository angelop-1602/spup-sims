"use client"

import * as React from "react"
import { PermissionGuard } from "@/components/auth/permission-guard"
import { useHrmAuth } from "@/components/auth/hrm-auth-guard"
import { TableTemplate } from "@/components/custom/table-template"
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
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
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
import { Edit3, Plus, Trash2 } from "lucide-react"
import {
  useApiQuery,
  useApiMutation,
  type DepartmentResponse,
  type PagedResponseOfDepartmentResponse,
  type CreateDepartmentRequest,
  type UpdateDepartmentRequest,
} from "@/lib/api"
import { Label } from "@/components/ui/label"
import { ApiErrorView } from "@/components/ui/api-error-view"
import { TableSkeletonRows } from "@/components/ui/table-skeleton-rows"

type DepartmentFormState = CreateDepartmentRequest & {
  parentDepartmentId?: number | string | null
}

export default function DepartmentsPage() {
  const { hasPermission } = useHrmAuth()

  const canCreate = hasPermission("org.departments.create")
  const canUpdate = hasPermission("org.departments.update")
  const canDelete = hasPermission("org.departments.delete")

  const [formState, setFormState] = React.useState<DepartmentFormState>({
    name: "",
    code: "",
    isActive: true,
    parentDepartmentId: null,
  })
  const [selectedDepartment, setSelectedDepartment] = React.useState<DepartmentResponse | null>(null)
  const [saving, setSaving] = React.useState(false)
  const [deletingId, setDeletingId] = React.useState<number | string | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)

  const handleError = React.useCallback((err: Error) => setError(err.message), [])

  const { data, loading, refresh, error: queryError } = useApiQuery<PagedResponseOfDepartmentResponse>(
    "/api/v1/organization/departments",
    { Page: 1, PageSize: 100, SortBy: "id" },
    { onError: handleError },
  )

  const departments = data?.data ?? []

  // Fetch all departments for parent selector (flat list)
  const { data: allDepartmentsData } = useApiQuery<PagedResponseOfDepartmentResponse>(
    "/api/v1/organization/departments",
    { Page: 1, PageSize: 100, SortBy: "id" },
    { onError: handleError },
  )

  const allDepartments = allDepartmentsData?.data ?? []

  const resetForm = React.useCallback(() => {
    setSelectedDepartment(null)
    setFormState({ name: "", code: "", isActive: true, parentDepartmentId: null })
  }, [])

  const openCreateDialog = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const openEditDialog = (department: DepartmentResponse) => {
    setSelectedDepartment(department)
    setFormState({
      name: department.name ?? "",
      code: department.code ?? "",
      isActive: department.isActive ?? true,
      parentDepartmentId: (department as any).parentDepartmentId ?? null,
    })
    setIsDialogOpen(true)
  }

  const { mutate: saveDepartment, loading: savingMutation } = useApiMutation()

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError(null)

    const path = selectedDepartment
      ? `/api/v1/organization/departments/${selectedDepartment.id}`
      : "/api/v1/organization/departments"

    const body: CreateDepartmentRequest | UpdateDepartmentRequest = {
      name: formState.name,
      code: formState.code,
      isActive: formState.isActive,
      parentDepartmentId: formState.parentDepartmentId ?? undefined,
    }

    const ok = await saveDepartment({
      path,
      method: selectedDepartment ? "PUT" : "POST",
      body,
    })

    setSaving(false)
    if (!ok) { setError("Unable to save department"); return }
    await refresh()
    resetForm()
    setIsDialogOpen(false)
  }

  const { mutate: deleteDepartment, loading: deletingMutation } = useApiMutation()

  const handleDelete = async (department: DepartmentResponse) => {
    setDeletingId(department.id)
    setError(null)
    const ok = await deleteDepartment({
      path: `/api/v1/organization/departments/${department.id}`,
      method: "DELETE",
    })
    setDeletingId(null)
    if (!ok) { setError("Unable to delete department"); return }
    await refresh()
  }

  return (
    <PermissionGuard requiredPermission="org.departments.view">
        <TableTemplate
          label="Departments table"
          actions={
            canCreate ? (
              <Button onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" />
                New department
              </Button>
            ) : undefined
          }
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Parent Department</TableHead>
                {(canUpdate || canDelete) && (
                  <TableHead className="text-right">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableSkeletonRows columns={5} rows={8} />
              ) : queryError ? (
                <TableRow>
                  <TableCell colSpan={5} className="p-0">
                    <ApiErrorView error={queryError} onRetry={refresh} fullScreen />
                  </TableCell>
                </TableRow>
              ) : departments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="p-6 text-center text-sm text-muted-foreground">
                    No departments available.
                  </TableCell>
                </TableRow>
              ) : (
                departments.map((department) => (
                  <TableRow key={String(department.id)}>
                    <TableCell>{department.id}</TableCell>
                    <TableCell>{department.code ?? "-"}</TableCell>
                    <TableCell>{department.name ?? ""}</TableCell>
                    <TableCell>
                      {((department as any).parentDepartmentName ?? "-")}
                    </TableCell>
                    {(canUpdate || canDelete) && (
                      <TableCell className="space-x-2 text-right">
                        {canUpdate && (
                          <Button
                            variant="outline"
                            size="icon-sm"
                            onClick={() => openEditDialog(department)}
                            aria-label={`Edit ${department.name}`}
                          >
                            <Edit3 aria-hidden="true" className="h-4 w-4" />
                          </Button>
                        )}
                        {canDelete && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="icon-sm"
                                aria-label={`Delete ${department.name}`}
                              >
                                <Trash2 aria-hidden="true" className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete department</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action will permanently remove <strong>{department.name}</strong>.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(department)}
                                  disabled={deletingId === department.id || deletingMutation}
                                >
                                  {deletingId === department.id ? "Deleting..." : "Delete"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableTemplate>

        {/* Create / Edit dialog */}
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm() }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedDepartment ? "Edit department" : "New department"}</DialogTitle>
              <DialogDescription>Manage the organization department record.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Name</label>
                <Input
                  value={formState.name}
                  onChange={(e) => setFormState((s) => ({ ...s, name: e.target.value }))}
                  placeholder="Department name"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Code</label>
                <Input
                  value={formState.code}
                  onChange={(e) => setFormState((s) => ({ ...s, code: e.target.value }))}
                  placeholder="Optional code"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Parent Department</label>
                <Select
                  value={String(formState.parentDepartmentId ?? "")}
                  onValueChange={(value) => setFormState((s) => ({ ...s, parentDepartmentId: value || null }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent department (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None (Top Level)</SelectItem>
                    {allDepartments.map((dept) => (
                      <SelectItem key={String(dept.id)} value={String(dept.id)}>
                        {dept.name ?? ""} ({dept.code ?? ""})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Active</label>
                <Select
                  value={String(formState.isActive)}
                  onValueChange={(value) => setFormState((s) => ({ ...s, isActive: value === "true" }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => { resetForm(); setIsDialogOpen(false) }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving || savingMutation}>
                  {saving || savingMutation ? "Saving..." : "Save department"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
    </PermissionGuard>
  )
}
