"use client"

import * as React from "react"
import { useMsal } from "@azure/msal-react"
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
import type { components } from "@/src/lib/api/schema"

type DepartmentRecord = components["schemas"]["EntityRecord"]
type PagedDepartmentResponse =
  components["schemas"]["ApiResponseOfPagedResponseOfEntityRecord"]

type DepartmentValues = {
  Code?: string
  Name?: string
  Description?: string
}

type DepartmentForm = {
  name: string
  description: string
}

const API_SCOPES =
  process.env.NEXT_PUBLIC_API_SCOPES?.split(/[\s,]+/).filter(Boolean) ?? [
    "User.Read",
  ]

function getValues(department: DepartmentRecord): DepartmentValues {
  return (department.values ?? {}) as DepartmentValues
}

export default function DepartmentsPage() {
  const { accounts, instance } = useMsal()
  const account = accounts[0]

  const [departments, setDepartments] = React.useState<DepartmentRecord[]>([])
  const [formState, setFormState] = React.useState<DepartmentForm>({
    name: "",
    description: "",
  })

  const [selectedDepartment, setSelectedDepartment] =
    React.useState<DepartmentRecord | null>(null)

  const [loading, setLoading] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [deletingId, setDeletingId] = React.useState<number | null>(null)
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

      const payload = (await response.json()) as PagedDepartmentResponse
      setDepartments(payload.data?.data ?? [])
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
      description: "",
    })
  }, [])

  const openCreateDialog = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const openEditDialog = (department: DepartmentRecord) => {
    const values = getValues(department)

    setSelectedDepartment(department)
    setFormState({
      name: values.Name ?? "",
      description: values.Description ?? "",
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
            entity: DEPARTMENT_ENTITY,
            values: {
              Name: formState.name,
              Description: formState.description,
            },
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

  const deleteDepartment = async (department: DepartmentRecord) => {
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
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Departments</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create, edit, and delete department entity records.
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
              departments.map((department) => {
                const values = getValues(department)

                return (
                  <TableRow key={`${department.entity}-${department.id}`}>
                    <TableCell>{department.id}</TableCell>
                    <TableCell>{values.Code ?? "-"}</TableCell>
                    <TableCell>{values.Name ?? "-"}</TableCell>
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
                )
              })
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
                Description
              </label>
              <Input
                value={formState.description}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                placeholder="Optional description"
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
  )
}