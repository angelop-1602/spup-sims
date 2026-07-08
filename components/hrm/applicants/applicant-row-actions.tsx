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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useApiMutation } from "@/lib/api"

const STATUS_OPTIONS = ["Submitted", "Pending", "Interview", "Hired", "Rejected"]

type Applicant = {
  id: number | string
  status: string
}

export function ApplicantRowActions({
  applicant,
  onChanged,
}: {
  applicant: Applicant
  onChanged: () => void
}) {
  const [editOpen, setEditOpen] = React.useState(false)
  const [status, setStatus] = React.useState(applicant.status)
  const [error, setError] = React.useState<Error | null>(null)
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

    onChanged()
    setEditOpen(false)
  }

  const handleDelete = async () => {
    const success = await deleteRow({
      path: `/api/v1/recruitment/employee-applicants/${applicant.id}`,
      method: "DELETE",
    })

    if (success) onChanged()
  }

  return (
    <>
      <Dialog open={editOpen} onOpenChange={handleEditOpenChange}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon-sm" aria-label="Edit applicant">
            <Edit3 className="h-3.5 w-3.5" />
          </Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit applicant</DialogTitle>
            <DialogDescription>Update this applicant&apos;s status.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Status <span className="text-destructive">*</span>
              </label>
              <Select value={status} onValueChange={setStatus} required>
                <SelectTrigger className="w-full">
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
          <Button variant="destructive" size="icon-sm" aria-label="Delete applicant">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete applicant</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this applicant record.
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
    </>
  )
}
