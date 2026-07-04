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
import { readFileAsDataUrl } from "@/lib/utils"

type AwardRecognition = components["schemas"]["AwardRecognitionResponse"]
type AwardRecognitionForm = components["schemas"]["AwardRecognitionRequest"]

function toForm(row: AwardRecognition): AwardRecognitionForm {
  return {
    awardingBody: row.awardingBody,
    natureAward: row.natureAward,
    dateReceived: row.dateReceived,
    attachment: row.attachment,
  }
}

export function AwardRecognitionRowActions({
  profileId,
  row,
  onChanged,
}: {
  profileId: number | string
  row: AwardRecognition
  onChanged: () => void
}) {
  const [editOpen, setEditOpen] = React.useState(false)
  const [form, setForm] = React.useState<AwardRecognitionForm>(() => toForm(row))
  const [error, setError] = React.useState<Error | null>(null)
  const { mutate: saveRow, loading: saving } = useApiMutation()
  const { mutate: deleteRow, loading: deleting } = useApiMutation()

  const handleEditOpenChange = (open: boolean) => {
    if (open) {
      setForm(toForm(row))
      setError(null)
    }
    setEditOpen(open)
  }

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    const success = await saveRow({
      path: `/api/v1/hrms/profiles/${profileId}/award-recognitions/${row.id}`,
      method: "PUT",
      body: form,
    })

    if (!success) {
      setError(new Error("Unable to update award / recognition"))
      return
    }

    onChanged()
    setEditOpen(false)
  }

  const handleDelete = async () => {
    const success = await deleteRow({
      path: `/api/v1/hrms/profiles/${profileId}/award-recognitions/${row.id}`,
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
            <DialogTitle>Edit award / recognition</DialogTitle>
            <DialogDescription>Update this award or recognition record.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Awarding Body</label>
              <Input
                value={form.awardingBody}
                onChange={(event) =>
                  setForm((current) => ({ ...current, awardingBody: event.target.value }))
                }
                placeholder="e.g. Civil Service Commission"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Nature of Award</label>
              <Input
                value={form.natureAward}
                onChange={(event) =>
                  setForm((current) => ({ ...current, natureAward: event.target.value }))
                }
                placeholder="e.g. Outstanding Employee"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Date Received</label>
              <Input
                type="date"
                value={form.dateReceived}
                onChange={(event) =>
                  setForm((current) => ({ ...current, dateReceived: event.target.value }))
                }
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Attachment</label>
              <Input
                type="file"
                accept="image/*,.pdf"
                onChange={async (event) => {
                  const file = event.target.files?.[0]
                  if (!file) return
                  const dataUrl = await readFileAsDataUrl(file)
                  setForm((current) => ({ ...current, attachment: dataUrl }))
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
            <AlertDialogTitle>Delete award / recognition</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this award or recognition record.
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
