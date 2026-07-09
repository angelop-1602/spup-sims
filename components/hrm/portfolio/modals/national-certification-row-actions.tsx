"use client"

import * as React from "react"
import { CalendarIcon, Edit3, Info, Trash2 } from "lucide-react"
import { format } from "date-fns"
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useApiMutation, type components } from "@/lib/api"
import { cn } from "@/lib/utils"

type NationalBoard = components["schemas"]["NationalBoardResponse"]
type NationalBoardForm = components["schemas"]["NationalBoardRequest"]

function toForm(row: NationalBoard): NationalBoardForm {
  return {
    certification: row.certification,
    rating: row.rating,
    licenseNumber: row.licenseNumber,
    validity: row.validity,
    remarks: row.remarks,
    attachment: row.attachment,
  }
}

export function NationalCertificationRowActions({
  profileId,
  row,
  onChanged,
}: {
  profileId: number | string
  row: NationalBoard
  onChanged: () => void
}) {
  const [editOpen, setEditOpen] = React.useState(false)
  const [form, setForm] = React.useState<NationalBoardForm>(() => toForm(row))
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
      path: `/api/v1/hrms/profiles/${profileId}/national-boards/${row.id}`,
      method: "PUT",
      body: form,
    })

    if (!success) {
      setError(new Error("Unable to update national certification"))
      return
    }

    if (attachmentFile) {
      const formData = new FormData()
      formData.append("file", attachmentFile)
      const uploaded = await saveRow({
        path: `/api/v1/hrms/profiles/${profileId}/national-boards/${row.id}/attachment`,
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
      path: `/api/v1/hrms/profiles/${profileId}/national-boards/${row.id}`,
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
            <DialogTitle>Edit national certification</DialogTitle>
            <DialogDescription>Update this board certification record.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Certification <span className="text-destructive">*</span>
              </label>
              <Input
                value={form.certification}
                onChange={(event) =>
                  setForm((current) => ({ ...current, certification: event.target.value }))
                }
                placeholder="e.g. Licensure Exam for Teachers"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                License Number <span className="text-destructive">*</span>
              </label>
              <Input
                value={form.licenseNumber}
                onChange={(event) =>
                  setForm((current) => ({ ...current, licenseNumber: event.target.value }))
                }
                placeholder="License Number"
                required
              />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-1 text-sm font-medium">
                <span>Rating</span>
                <span className="text-destructive">*</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info size={14} className="shrink-0" />
                  </TooltipTrigger>
                  <TooltipContent>Input NA if not applicable.</TooltipContent>
                </Tooltip>
              </label>
              <Input
                value={form.rating ?? ""}
                onChange={(event) =>
                  setForm((current) => ({ ...current, rating: event.target.value || null }))
                }
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Validity <span className="text-destructive">*</span>
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start font-normal",
                      !form.validity && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 size-4" />
                    {form.validity ? format(new Date(form.validity), "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.validity ? new Date(form.validity) : undefined}
                    onSelect={(date) =>
                      setForm((current) => ({
                        ...current,
                        validity: date ? format(date, "yyyy-MM-dd") : null,
                      }))
                    }
                    captionLayout="dropdown"
                  />
                </PopoverContent>
              </Popover>
              <input
                type="text"
                value={form.validity ?? ""}
                onChange={() => {}}
                required
                className="sr-only"
                tabIndex={-1}
              />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-1 text-sm font-medium">
                <span>Remarks</span>
                <span className="text-destructive">*</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info size={14} className="shrink-0" />
                  </TooltipTrigger>
                  <TooltipContent>Renewal every after 2 years.</TooltipContent>
                </Tooltip>
              </label>
              <Input
                value={form.remarks ?? ""}
                onChange={(event) =>
                  setForm((current) => ({ ...current, remarks: event.target.value || null }))
                }
                required
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
                required={!row.attachment}
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
            <AlertDialogTitle>Delete national certification</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this board certification record.
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
