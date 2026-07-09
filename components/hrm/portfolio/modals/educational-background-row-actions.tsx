"use client"

import * as React from "react"
import { CalendarIcon, Edit3, Trash2, Info, Plus } from "lucide-react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useApiMutation, type components } from "@/lib/api"
import { EDUCATIONAL_ATTAINMENT_OPTIONS } from "@/components/hrm/portfolio/educational-attainment-options"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

type EducationalBackground = components["schemas"]["EducationalBackgroundResponse"] & {
  educationalAttainment?: string | number | null
  diploma?: string | null
  tor?: string | null
}
type EducationalBackgroundForm = Omit<components["schemas"]["EducationalBackgroundRequest"], "educationalAttainment"> & {
  educationalAttainment: string | null
}

function toForm(row: EducationalBackground): EducationalBackgroundForm {
  return {
    educationId: row.educationId,
    educationalAttainment:
      row.educationalAttainment === null || row.educationalAttainment === undefined
        ? ""
        : String(row.educationalAttainment),
    degreeLevel: row.degreeLevel,
    degree: row.degree,
    institution: row.institution,
    dateGraduated: row.dateGraduated,
    diploma: row.diploma ?? null,
    tor: row.tor ?? null,
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
  const [diplomaFile, setDiplomaFile] = React.useState<File | null>(null)
  const [torFile, setTorFile] = React.useState<File | null>(null)
  const [error, setError] = React.useState<Error | null>(null)
  const { mutate: saveRow, loading: saving } = useApiMutation()
  const { mutate: deleteRow, loading: deleting } = useApiMutation()
  const degreeLevelRequired = form.educationalAttainment === "Postgraduate"

  const handleEditOpenChange = (open: boolean) => {
    if (open) {
      setForm(toForm(row))
      setDiplomaFile(null)
      setTorFile(null)
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

    if (diplomaFile) {
      const formData = new FormData()
      formData.append("file", diplomaFile)
      const uploaded = await saveRow({
        path: `/api/v1/hrms/profiles/${profileId}/educational-backgrounds/${row.id}/diploma`,
        method: "POST",
        body: formData,
      })

      if (!uploaded) {
        setError(new Error("Unable to upload diploma"))
        return
      }
    }

    if (torFile) {
      const formData = new FormData()
      formData.append("file", torFile)
      const uploaded = await saveRow({
        path: `/api/v1/hrms/profiles/${profileId}/educational-backgrounds/${row.id}/tor`,
        method: "POST",
        body: formData,
      })

      if (!uploaded) {
        setError(new Error("Unable to upload transcript of records"))
        return
      }
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
              <label className="mb-2 block text-sm font-medium">
                Educational Attainment <span className="text-destructive">*</span>
              </label>
              <Select
                value={form.educationalAttainment ?? ""}
                onValueChange={(value) =>
                  setForm((current) => ({ ...current, educationalAttainment: value }))
                }
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select attainment" />
                </SelectTrigger>
                <SelectContent position="popper" side="bottom" avoidCollisions={false}>
                  {EDUCATIONAL_ATTAINMENT_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Degree Level {degreeLevelRequired && <span className="text-destructive">*</span>}
              </label>
              <Input
                value={form.degreeLevel}
                onChange={(event) =>
                  setForm((current) => ({ ...current, degreeLevel: event.target.value }))
                }
                placeholder="e.g. Bachelor's, Master's"
                required={degreeLevelRequired}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Degree <span className="text-destructive">*</span>
              </label>
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
              <label className="mb-2 flex items-center gap-1 text-sm font-medium">
                <span>Name of School/University</span>
                <span className="text-destructive">*</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info size={14} className="shrink-0" />
                  </TooltipTrigger>
                  <TooltipContent>
                    Please do not abbreviate the name of the school/university.
                  </TooltipContent>
                </Tooltip>
              </label>
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
              <label className="mb-2 block text-sm font-medium">
                Date Graduated <span className="text-destructive">*</span>
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start font-normal",
                      !form.dateGraduated && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 size-4" />
                    {form.dateGraduated
                      ? format(new Date(form.dateGraduated), "PPP")
                      : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.dateGraduated ? new Date(form.dateGraduated) : undefined}
                    onSelect={(date) =>
                      setForm((current) => ({
                        ...current,
                        dateGraduated: date ? format(date, "yyyy-MM-dd") : null,
                      }))
                    }
                    captionLayout="dropdown"
                  />
                </PopoverContent>
              </Popover>
              <input
                type="text"
                value={form.dateGraduated ?? ""}
                onChange={() => {}}
                required
                className="sr-only"
                tabIndex={-1}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Diploma</label>
              {row.diploma && (
                <p className="mb-2 truncate text-sm text-muted-foreground">
                  Current: {row.diploma.split("/").pop()}
                </p>
              )}
              <Input
                type="file"
                accept="image/*,.pdf"
                onChange={(event) => {
                  setDiplomaFile(event.target.files?.[0] ?? null)
                }}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Transcript of Records (TOR)</label>
              {row.tor && (
                <p className="mb-2 truncate text-sm text-muted-foreground">
                  Current: {row.tor.split("/").pop()}
                </p>
              )}
              <Input
                type="file"
                accept="image/*,.pdf"
                onChange={(event) => {
                  setTorFile(event.target.files?.[0] ?? null)
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
