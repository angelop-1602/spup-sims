"use client"

import * as React from "react"
import { PermissionGuard } from "@/components/auth/permission-guard"
import { useHrmAuth } from "@/components/auth/hrm-auth-guard"
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
import { Edit3, Loader2, Plus, Trash2 } from "lucide-react"
import {
  useApiQuery,
  useApiMutation,
  type PositionResponse,
  type PagedResponseOfPositionResponse,
  type CreatePositionRequest,
  type UpdatePositionRequest,
} from "@/lib/api"
import { ApiErrorView } from "@/components/ui/api-error-view"

export default function PositionsPage() {
  const { hasPermission } = useHrmAuth()

  const canCreate = hasPermission("org.positions.create")
  const canUpdate = hasPermission("org.positions.update")
  const canDelete = hasPermission("org.positions.delete")

  const [formState, setFormState] = React.useState<CreatePositionRequest>({
    code: "",
    name: "",
    description: null,
    isAcademic: false,
    isActive: true,
  })
  const [selectedPosition, setSelectedPosition] = React.useState<PositionResponse | null>(null)
  const [saving, setSaving] = React.useState(false)
  const [deletingId, setDeletingId] = React.useState<number | string | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)

  const handleError = React.useCallback((err: Error) => setError(err.message), [])

  const { data, loading, refresh, error: queryError } = useApiQuery<PagedResponseOfPositionResponse>(
    "/api/v1/organization/positions",
    { Page: 1, PageSize: 50, SortBy: "id" },
    { onError: handleError },
  )

  const positions = data?.data ?? []

  const resetForm = React.useCallback(() => {
    setSelectedPosition(null)
    setFormState({ code: "", name: "", description: null, isAcademic: false, isActive: true })
  }, [])

  const openCreateDialog = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const openEditDialog = (position: PositionResponse) => {
    setSelectedPosition(position)
    setFormState({
      code: position.code ?? "",
      name: position.name ?? "",
      description: position.description ?? null,
      isAcademic: position.isAcademic ?? false,
      isActive: position.isActive ?? true,
    })
    setIsDialogOpen(true)
  }

  const { mutate: savePosition, loading: savingMutation } = useApiMutation()

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError(null)

    const path = selectedPosition
      ? `/api/v1/organization/positions/${selectedPosition.id}`
      : "/api/v1/organization/positions"

    const body: CreatePositionRequest | UpdatePositionRequest = {
      code: formState.code,
      name: formState.name,
      description: formState.description,
      isAcademic: formState.isAcademic,
      isActive: formState.isActive,
    }

    const ok = await savePosition({
      path,
      method: selectedPosition ? "PUT" : "POST",
      body,
    })

    setSaving(false)
    if (!ok) { setError("Unable to save position"); return }
    await refresh()
    resetForm()
    setIsDialogOpen(false)
  }

  const { mutate: deletePosition, loading: deletingMutation } = useApiMutation()

  const handleDelete = async (position: PositionResponse) => {
    setDeletingId(position.id)
    setError(null)
    const ok = await deletePosition({
      path: `/api/v1/organization/positions/${position.id}`,
      method: "DELETE",
    })
    setDeletingId(null)
    if (!ok) { setError("Unable to delete position"); return }
    await refresh()
  }

  return (
    <PermissionGuard requiredPermission="org.positions.view">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Positions</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Create, edit, and delete position records (replaces designations).
            </p>
          </div>
          {canCreate && (
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              New position
            </Button>
          )}
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
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                {(canUpdate || canDelete) && (
                  <TableHead className="text-right">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="p-6 text-center">
                    <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading positions...
                    </span>
                  </TableCell>
                </TableRow>
              ) : queryError ? (
                <TableRow>
                  <TableCell colSpan={6} className="p-0">
                    <ApiErrorView error={queryError} onRetry={refresh} fullScreen />
                  </TableCell>
                </TableRow>
              ) : positions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="p-6 text-center text-sm text-muted-foreground">
                    No positions available.
                  </TableCell>
                </TableRow>
              ) : (
                positions.map((position) => (
                  <TableRow key={String(position.id)}>
                    <TableCell>{position.id}</TableCell>
                    <TableCell>{position.code ?? "-"}</TableCell>
                    <TableCell>{position.name ?? ""}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700">
                        {position.isAcademic ? "Academic" : "Non-Academic"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium " +
                          (position.isActive ? "bg-green-50 text-green-700" : "bg-zinc-100 text-zinc-600")
                        }
                      >
                        {position.isActive ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    {(canUpdate || canDelete) && (
                      <TableCell className="space-x-2 text-right">
                        {canUpdate && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(position)}
                          >
                            <Edit3 className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                        )}
                        {canDelete && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete position</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action will permanently remove <strong>{position.name}</strong>.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(position)}
                                  disabled={deletingId === position.id || deletingMutation}
                                >
                                  {deletingId === position.id ? "Deleting..." : "Delete"}
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
        </div>

        {/* Create / Edit dialog */}
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm() }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedPosition ? "Edit position" : "New position"}</DialogTitle>
              <DialogDescription>Manage the organization position record.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <Label htmlFor="pos-code">Code <span className="text-destructive">*</span></Label>
                <Input
                  id="pos-code"
                  value={formState.code}
                  onChange={(e) => setFormState((s) => ({ ...s, code: e.target.value }))}
                  placeholder="e.g., SYSADM"
                  required
                  maxLength={20}
                />
              </div>
              <div>
                <Label htmlFor="pos-title">Title <span className="text-destructive">*</span></Label>
                <Input
                  id="pos-title"
                  value={formState.name}
                  onChange={(e) => setFormState((s) => ({ ...s, name: e.target.value }))}
                  placeholder="e.g., Systems Administrator"
                  required
                  maxLength={200}
                />
              </div>
              <div>
                <Label htmlFor="pos-description">Description</Label>
                <Input
                  id="pos-description"
                  value={formState.description ?? ""}
                  onChange={(e) => setFormState((s) => ({ ...s, description: e.target.value || null }))}
                  placeholder="Optional description"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Position Type</Label>
                  <Select
                    value={String(formState.isAcademic)}
                    onValueChange={(value) => setFormState((s) => ({ ...s, isAcademic: value === "true" }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">Non-Academic</SelectItem>
                      <SelectItem value="true">Academic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
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
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => { resetForm(); setIsDialogOpen(false) }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving || savingMutation}>
                  {saving || savingMutation ? "Saving..." : selectedPosition ? "Save changes" : "Create position"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </PermissionGuard>
  )
}
