"use client"

import * as React from "react"
import { useMsal } from "@azure/msal-react"
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
type Department = {
  id: number | string
  code?: string | null
  Code?: string | null
  name?: string | null
  Name?: string | null
}

type DepartmentForm = {
  name: string
  Code: string
}

function getDepartmentCode(department: Department) {
  return department.code ?? department.Code ?? "-"
}

function getDepartmentName(department: Department) {
  return department.name ?? department.Name ?? ""
}

const API_SCOPES =
  process.env.NEXT_PUBLIC_API_SCOPES?.split(/[\s,]+/).filter(Boolean) ?? [
    "User.Read",
  ]

export default function DepartmentsPage() {
  const { accounts, instance } = useMsal()
  const account = accounts[0]

  const [departments, setDepartments] = React.useState<Department[]>([])
  const [formState, setFormState] = React.useState<DepartmentForm>({
    name: "",
    Code: "",
  })

  const [selectedDepartment, setSelectedDepartment] =
    React.useState<Department | null>(null)

  const [loading, setLoading] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [deletingId, setDeletingId] = React.useState<number | string | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)

  const authorizedHeaders = React.useCallback(async () => {
    if (!account) {
      throw new Error("No authenticated account available")
    }

    const result = await instance.acquireTokenSilent({
      scopes: API_SCOPES,
      account,
    })

    return {
      Authorization: `Bearer ${result.accessToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    }
  }, [account, instance])

  const loadDepartments = React.useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const headers = await authorizedHeaders()

      const response = await fetch(
        "/api/organization/departments?Page=1&PageSize=50&SortBy=id",
        {
          headers,
          cache: "no-store",
        },
      )

      if (!response.ok) {
        throw new Error(`Failed to load departments (${response.status})`)
      }

      const payload = await response.json()
      const pagedData =
        payload?.data?.data ?? payload?.data ?? payload
      setDepartments(Array.isArray(pagedData) ? pagedData : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load departments")
    } finally {
      setLoading(false)
    }
  }, [authorizedHeaders])

  React.useEffect(() => {
    if (account) {
      void loadDepartments()
    }
  }, [account, loadDepartments])

  const resetForm = React.useCallback(() => {
    setSelectedDepartment(null)
    setFormState({
      name: "",
      Code: "",
    
    })
  }, [])

  const openCreateDialog = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const openEditDialog = (department: Department) => {
    setSelectedDepartment(department)
    setFormState({
      name: getDepartmentName(department),
      Code: getDepartmentCode(department),
    })
    setIsDialogOpen(true)
  }

  const saveDepartment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setSaving(true)
    setError(null)

    try {
      const headers = await authorizedHeaders()

      const response = await fetch(
        selectedDepartment
          ? `/api/organization/departments/${selectedDepartment.id}`
          : "/api/organization/departments",
        {
          method: selectedDepartment ? "PUT" : "POST",
          headers,
          cache: "no-store",
          body: JSON.stringify({
            name: formState.name,
            code: formState.Code,
          }),
        },
      )

      if (!response.ok) {
        throw new Error(`Failed to save department (${response.status})`)
      }

      await loadDepartments()
      resetForm()
      setIsDialogOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save department")
    } finally {
      setSaving(false)
    }
  }

  const deleteDepartment = async (department: Department) => {
    setDeletingId(department.id)
    setError(null)

    try {
      const headers = await authorizedHeaders()

      const response = await fetch(
        `/api/organization/departments/${department.id}`,
        {
          method: "DELETE",
          headers,
          cache: "no-store",
        },
      )

      if (!response.ok) {
        throw new Error(`Failed to delete department (${response.status})`)
      }

      await loadDepartments()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete department")
    } finally {
      setDeletingId(null)
    }
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
                  <TableCell>{getDepartmentCode(department)}</TableCell>
                  <TableCell>{getDepartmentName(department) || "-"}</TableCell>
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
                              onClick={() => deleteDepartment(department)}
                              disabled={deletingId === department.id}
                            >
                              {deletingId === department.id ? "Deleting..." : "Delete"}
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

          <form onSubmit={saveDepartment} className="space-y-4">
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
              <label className="mb-2 block text-sm font-medium">
                Code
              </label>
              <Input
                value={formState.Code}
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

              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save department"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
    </PermissionGuard>
  )
}
