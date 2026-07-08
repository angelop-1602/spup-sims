"use client"

import * as React from "react"
import { CalendarIcon, Edit3, Trash2 } from "lucide-react"
import { addDays, format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useApiMutation, type components } from "@/lib/api"
import { cn } from "@/lib/utils"

type WorkExperience = components["schemas"]["WorkExperienceResponse"]
type WorkExperienceForm = components["schemas"]["WorkExperienceRequest"]

function toForm(row: WorkExperience): WorkExperienceForm {
  return {
    jobTitle: row.jobTitle,
    institution: row.institution,
    startDate: row.startDate,
    endDate: row.endDate,
    attachment: row.attachment,
  }
}

export function WorkExperienceRowActions({
  profileId,
  row,
  onChanged,
}: {
  profileId: number | string
  row: WorkExperience
  onChanged: () => void
}) {
  const [editOpen, setEditOpen] = React.useState(false)
  const [form, setForm] = React.useState<WorkExperienceForm>(() => toForm(row))
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
      path: `/api/v1/hrms/profiles/${profileId}/work-experiences/${row.id}`,
      method: "PUT",
      body: form,
    })

    if (!success) {
      setError(new Error("Unable to update work experience"))
      return
    }

    if (attachmentFile) {
      const formData = new FormData()
      formData.append("file", attachmentFile)
      const uploaded = await saveRow({
        path: `/api/v1/hrms/profiles/${profileId}/work-experiences/${row.id}/attachment`,
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
      path: `/api/v1/hrms/profiles/${profileId}/work-experiences/${row.id}`,
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
            <DialogTitle>Edit work experience</DialogTitle>
            <DialogDescription>Update this employment record.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Job Title <span className="text-destructive">*</span>
              </label>
              <Input
                value={form.jobTitle}
                onChange={(event) =>
                  setForm((current) => ({ ...current, jobTitle: event.target.value }))
                }
                placeholder="e.g. Software Engineer"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Institution <span className="text-destructive">*</span>
              </label>
              <Input
                value={form.institution}
                onChange={(event) =>
                  setForm((current) => ({ ...current, institution: event.target.value }))
                }
                placeholder="Company or organization"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Start Date <span className="text-destructive">*</span>
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start font-normal",
                      !form.startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 size-4" />
                    {form.startDate ? format(new Date(form.startDate), "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.startDate ? new Date(form.startDate) : undefined}
                    onSelect={(date) =>
                      setForm((current) => {
                        const startDate = date ? format(date, "yyyy-MM-dd") : ""
                        const endDate =
                          current.endDate && startDate && current.endDate <= startDate
                            ? null
                            : current.endDate
                        return { ...current, startDate, endDate }
                      })
                    }
                    captionLayout="dropdown"
                  />
                </PopoverContent>
              </Popover>
              <input
                type="text"
                value={form.startDate}
                onChange={() => {}}
                required
                className="sr-only"
                tabIndex={-1}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                End Date <span className="text-destructive">*</span>
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start font-normal",
                      !form.endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 size-4" />
                    {form.endDate ? format(new Date(form.endDate), "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.endDate ? new Date(form.endDate) : undefined}
                    onSelect={(date) =>
                      setForm((current) => ({
                        ...current,
                        endDate: date ? format(date, "yyyy-MM-dd") : null,
                      }))
                    }
                    disabled={form.startDate ? { before: addDays(new Date(form.startDate), 1) } : undefined}
                    captionLayout="dropdown"
                  />
                </PopoverContent>
              </Popover>
              <input
                type="text"
                value={form.endDate ?? ""}
                onChange={() => {}}
                required
                className="sr-only"
                tabIndex={-1}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Attachment <span className="text-destructive">*</span>
              </label>
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
                required
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
            <AlertDialogTitle>Delete work experience</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this employment record.
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
