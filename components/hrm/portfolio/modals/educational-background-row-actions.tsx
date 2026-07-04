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

type EducationalBackground = components["schemas"]["EducationalBackgroundResponse"]
type EducationalBackgroundForm = components["schemas"]["EducationalBackgroundRequest"]

function toForm(row: EducationalBackground): EducationalBackgroundForm {
  return {
    educationId: row.educationId,
    degreeLevel: row.degreeLevel,
    degree: row.degree,
    institution: row.institution,
    dateGraduated: row.dateGraduated,
  }
}

export function EducationalBackgroundRowActions({
  profileId,
  row,
  onChanged,
}: {
  profileId: number | string
  row: EducationalBackground
  onChanged: () => void
}) {
  const [editOpen, setEditOpen] = React.useState(false)
  const [form, setForm] = React.useState<EducationalBackgroundForm>(() => toForm(row))
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
      path: `/api/v1/hrms/profiles/${profileId}/educational-backgrounds/${row.id}`,
      method: "PUT",
      body: form,
    })

    if (!success) {
      setError(new Error("Unable to update educational background"))
      return
    }

    onChanged()
    setEditOpen(false)
  }

  const handleDelete = async () => {
    const success = await deleteRow({
      path: `/api/v1/hrms/profiles/${profileId}/educational-backgrounds/${row.id}`,
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
            <DialogTitle>Edit educational background</DialogTitle>
            <DialogDescription>Update this degree record.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Degree Level</label>
              <Input
                value={form.degreeLevel}
                onChange={(event) =>
                  setForm((current) => ({ ...current, degreeLevel: event.target.value }))
                }
                placeholder="e.g. Bachelor's, Master's"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Degree</label>
              <Input
                value={form.degree}
                onChange={(event) =>
                  setForm((current) => ({ ...current, degree: event.target.value }))
                }
                placeholder="e.g. BS Computer Science"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Institution</label>
              <Input
                value={form.institution}
                onChange={(event) =>
                  setForm((current) => ({ ...current, institution: event.target.value }))
                }
                placeholder="School or university"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Date Graduated</label>
              <Input
                type="date"
                value={form.dateGraduated ?? ""}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    dateGraduated: event.target.value || null,
                  }))
                }
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
            <AlertDialogTitle>Delete educational background</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this degree record.
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
