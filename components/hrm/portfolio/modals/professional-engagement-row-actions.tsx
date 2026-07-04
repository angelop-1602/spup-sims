"use client"

import * as React from "react"
import { Edit3, Trash2 } from "lucide-react"
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
import { Input } from "@/components/ui/input"
import { useApiMutation, type components } from "@/lib/api"

type ProfessionalEngagement = components["schemas"]["ProfessionalEngagementResponse"]
type ProfessionalEngagementForm = Omit<components["schemas"]["ProfessionalEngagementRequest"], "attachment">

function toForm(row: ProfessionalEngagement): ProfessionalEngagementForm {
  return {
    engagementType: row.engagementType,
    engagementName: row.engagementName,
    remarks: row.remarks,
  }
}

export function ProfessionalEngagementRowActions({
  profileId,
  row,
  onChanged,
}: {
  profileId: number | string
  row: ProfessionalEngagement
  onChanged: () => void
}) {
  const [editOpen, setEditOpen] = React.useState(false)
  const [form, setForm] = React.useState<ProfessionalEngagementForm>(() => toForm(row))
  const [attachmentFile, setAttachmentFile] = React.useState<File | null>(null)
  const [error, setError] = React.useState<Error | null>(null)
  const { mutate: saveRow, loading: saving } = useApiMutation()
  const { mutate: deleteRow, loading: deleting } = useApiMutation()

  const handleEditOpenChange = (open: boolean) => {
    if (open) {
      setForm(toForm(row))
      setAttachmentFile(null)
      setError(null)
    }
    setEditOpen(open)
  }

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    const success = await saveRow({
      path: `/api/v1/hrms/profiles/${profileId}/professional-engagements/${row.id}`,
      method: "PUT",
      body: form,
    })

    if (!success) {
      setError(new Error("Unable to update professional engagement"))
      return
    }

    if (attachmentFile) {
      const formData = new FormData()
      formData.append("file", attachmentFile)
      const uploaded = await saveRow({
        path: `/api/v1/hrms/profiles/${profileId}/professional-engagements/${row.id}/attachment`,
        method: "POST",
        body: formData,
      })

      if (!uploaded) {
        setError(new Error("Unable to upload attachment"))
        return
      }
    }

    onChanged()
    setEditOpen(false)
  }

  const handleDelete = async () => {
    const success = await deleteRow({
      path: `/api/v1/hrms/profiles/${profileId}/professional-engagements/${row.id}`,
      method: "DELETE",
    })

    if (success) onChanged()
  }

  return (
    <div className="flex justify-end gap-2">
      <Dialog open={editOpen} onOpenChange={handleEditOpenChange}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon-sm" aria-label="Edit">
            <Edit3 className="h-3.5 w-3.5" />
          </Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit professional engagement</DialogTitle>
            <DialogDescription>Update this professional engagement record.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Engagement Type <span className="text-destructive">*</span>
              </label>
              <Input
                value={form.engagementType}
                onChange={(event) =>
                  setForm((current) => ({ ...current, engagementType: event.target.value }))
                }
                placeholder="e.g. Consultancy, Resource Speaker"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Engagement Name <span className="text-destructive">*</span>
              </label>
              <Input
                value={form.engagementName}
                onChange={(event) =>
                  setForm((current) => ({ ...current, engagementName: event.target.value }))
                }
                placeholder="e.g. National HR Summit 2026"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Remarks</label>
              <Input
                value={form.remarks ?? ""}
                onChange={(event) =>
                  setForm((current) => ({ ...current, remarks: event.target.value || null }))
                }
                placeholder="Optional"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Attachment</label>
              {row.attachment && (
                <p className="mb-2 truncate text-sm text-muted-foreground">
                  Current: {row.attachment.split("/").pop()}
                </p>
              )}
              <Input
                type="file"
                accept="image/*,.pdf"
                onChange={(event) => {
                  setAttachmentFile(event.target.files?.[0] ?? null)
                }}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error.message}</p>}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" size="icon-sm" aria-label="Delete">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete professional engagement</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this professional engagement record.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
