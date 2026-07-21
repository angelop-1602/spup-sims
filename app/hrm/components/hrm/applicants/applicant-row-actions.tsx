"use client"

import * as React from "react"
import { Edit3, Eye, Trash2 } from "lucide-react"
import { TableRowActions } from "@/components/custom/table-row-actions"
import { Button } from "@/components/ui/button"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useApiMutation } from "@/lib/api"
import { notifyDeleted, notifyUpdated } from "@/lib/notifications"

const STATUS_OPTIONS = ["Submitted", "Pending", "Interview", "Hired", "Rejected"]

type Applicant = {
  id: number | string
  status: string
}

export function ApplicantRowActions({
  applicant,
  applicantLabel,
  canDelete,
  canEdit,
  idPrefix,
  onView,
  onChanged,
}: {
  applicant: Applicant
  applicantLabel: string
  canDelete: boolean
  canEdit: boolean
  idPrefix: string
  onView: () => void
  onChanged: () => void | Promise<void>
}) {
  const [editOpen, setEditOpen] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const [status, setStatus] = React.useState(applicant.status)
  const [error, setError] = React.useState<Error | null>(null)
  const [deleteError, setDeleteError] = React.useState<string | null>(null)
  const { mutate: saveRow, loading: saving } = useApiMutation()
  const { mutate: deleteRow, loading: deleting } = useApiMutation()

  const handleEditOpenChange = (open: boolean) => {
    if (open) {
      setStatus(applicant.status)
      setError(null)
    }
    setEditOpen(open)
  }

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    const success = await saveRow({
      path: `/api/v1/recruitment/employee-applicants/${applicant.id}`,
      method: "PUT",
      body: { status },
    })

    if (!success) {
      setError(new Error("Unable to update applicant"))
      return
    }

    await onChanged()
    setEditOpen(false)
    notifyUpdated("Applicant record")
  }

  const handleDelete = async () => {
    setDeleteError(null)
    const success = await deleteRow({
      path: `/api/v1/recruitment/employee-applicants/${applicant.id}`,
      method: "DELETE",
    })

    if (!success) {
      setDeleteError("Unable to delete this applicant record. Please try again.")
      return
    }

    await onChanged()
    setDeleteOpen(false)
    notifyDeleted("Applicant record")
  }

  return (
    <>
      <TableRowActions
        label={`Actions for ${applicantLabel}`}
        actions={[
          {
            label: "View profile",
            icon: <Eye aria-hidden="true" />,
            onSelect: onView,
          },
          ...(canEdit
            ? [
                {
                  label: "Edit status",
                  icon: <Edit3 aria-hidden="true" />,
                  onSelect: () => handleEditOpenChange(true),
                },
              ]
            : []),
          ...(canDelete
            ? [
                {
                  label: "Delete applicant",
                  icon: <Trash2 aria-hidden="true" />,
                  onSelect: () => setDeleteOpen(true),
                  variant: "destructive" as const,
                },
              ]
            : []),
        ]}
      />

      {canEdit ? (
        <Dialog open={editOpen} onOpenChange={handleEditOpenChange}>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit applicant</DialogTitle>
              <DialogDescription>Update this applicant&apos;s status.</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSave} className="space-y-4">
              <Field data-invalid={Boolean(error)}>
                <FieldLabel htmlFor={`${idPrefix}-applicant-status-${applicant.id}`}>
                  Status
                </FieldLabel>
                <Select value={status} onValueChange={setStatus} required>
                  <SelectTrigger
                    id={`${idPrefix}-applicant-status-${applicant.id}`}
                    className="h-10 w-full px-3 text-sm"
                    aria-invalid={Boolean(error)}
                  >
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent position="popper" side="bottom" avoidCollisions={false}>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError>{error?.message}</FieldError>
              </Field>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="min-w-28" disabled={saving}>
                  {saving ? "Saving..." : "Save changes"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      ) : null}

      {canDelete ? (
        <AlertDialog
          open={deleteOpen}
          onOpenChange={(open) => {
            if (deleting) return
            setDeleteOpen(open)
            if (!open) setDeleteError(null)
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete applicant record?</AlertDialogTitle>
              <AlertDialogDescription>
                This permanently removes {applicantLabel} and cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>

            {deleteError ? (
              <p role="alert" className="text-sm text-destructive">
                {deleteError}
              </p>
            ) : null}

            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={(event) => {
                  event.preventDefault()
                  void handleDelete()
                }}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete applicant"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : null}
    </>
  )
}
