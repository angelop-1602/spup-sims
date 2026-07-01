"use client"

import * as React from "react"
import { PermissionGuard } from "@/components/auth/permission-guard"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Edit3, Loader2, Plus, Trash2 } from "lucide-react"
import {
  useApiQuery,
  useApiMutation,
  type components,
} from "@/lib/api"

type Department = components["schemas"]["DepartmentResponse"]
type PagedDepartments = components["schemas"]["PagedResponseOfDepartmentResponse"]
type DepartmentForm = components["schemas"]["CreateDepartmentRequest"]

export default function DepartmentsPage() {
  const [formState, setFormState] = React.useState<DepartmentForm>({
    name: "",
    code: "",
  })

  const [selectedDepartment, setSelectedDepartment] =
    React.useState<Department | null>(null)

  const [saving, setSaving] = React.useState(false)
  const [deletingId, setDeletingId] = React.useState<number | string | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)

  // Stabilized so the query's `onError` dep doesn't change every render
  // (a new inline callback each render would otherwise re-fetch in a loop).
  const handleError = React.useCallback(
    (err: Error) => setError(err.message),
    [],
  )

  const { data, loading, refresh } = useApiQuery<PagedDepartments>(
    "/api/organization/departments",
    { Page: 1, PageSize: 50, SortBy: "id" },
    { onError: handleError },
  )

  const departments = data?.data ?? []

  const resetForm = React.useCallback(() => {
    setSelectedDepartment(null)
    setFormState({ name: "", code: "" })
  }, [])

  const openCreateDialog = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const openEditDialog = (department: Department) => {
    setSelectedDepartment(department)
    setFormState({
      name: department.name ?? "",
      code: department.code ?? "",
    })
    setIsDialogOpen(true)
  }

  const { mutate: saveDepartment, loading: savingMutation } = useApiMutation()

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setSaving(true)
    setError(null)

    const path = selectedDepartment
      ? `/api/organization/departments/${selectedDepartment.id}`
      : "/api/organization/departments"

    const success = await saveDepartment({
      path,
      method: selectedDepartment ? "PUT" : "POST",
      body: { name: formState.name, code: formState.code },
    })

    setSaving(false)

    if (!success) {
      setError("Unable to save department")
      return
    }

    await refresh()
    resetForm()
    setIsDialogOpen(false)
  }

  const { mutate: deleteDepartment, loading: deletingMutation } = useApiMutation()

  const handleDelete = async (department: Department) => {
    setDeletingId(department.id)
    setError(null)

    const success = await deleteDepartment({
      path: `/api/organization/departments/${department.id}`,
      method: "DELETE",
    })

    setDeletingId(null)

    if (!success) {
      setError("Unable to delete department")
      return
    }

    await refresh()
  }

  return (
    <PermissionGuard requiredPermissions={["organization.departments.view"]}>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Departments</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Create, edit, and delete department records.
            </p>
          </div>

          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            New department
          </Button>
        </div>

        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="p-6 text-center">
                    <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading departments...
                    </span>
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
                    <TableCell className="space-x-2 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(department)}
                      >
                        <Edit3 className="mr-2 h-4 w-4" />
                        Edit
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>

                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete department</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action will permanently remove this department.
                            </AlertDialogDescription>
                          </AlertDialogHeader>

                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(department)}
                              disabled={
                                deletingId === department.id || deletingMutation
                              }
                            >
                              {deletingId === department.id
                                ? "Deleting..."
                                : "Delete"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) resetForm()
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedDepartment ? "Edit department" : "New department"}
              </DialogTitle>
              <DialogDescription>
                Manage the organization department record.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Name</label>
                <Input
                  value={formState.name}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Department name"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Code</label>
                <Input
                  value={formState.code}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      code: event.target.value,
                    }))
                  }
                  placeholder="Optional code"
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm()
                    setIsDialogOpen(false)
                  }}
                >
                  Cancel
                </Button>

                <Button type="submit" disabled={saving || savingMutation}>
                  {saving || savingMutation ? "Saving..." : "Save department"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </PermissionGuard>
  )
}
