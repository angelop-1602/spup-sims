"use client"

import * as React from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
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

type EducationalBackgroundForm = components["schemas"]["EducationalBackgroundRequest"]

const EMPTY_FORM: EducationalBackgroundForm = {
  educationId: null,
  degreeLevel: "",
  degree: "",
  institution: "",
  dateGraduated: null,
}

export function EducationalBackgroundAddDialog({
  profileId,
  onCreated,
}: {
  profileId: number | string
  onCreated: () => void
}) {
  const [open, setOpen] = React.useState(false)
  const [form, setForm] = React.useState<EducationalBackgroundForm>(EMPTY_FORM)
  const { mutate, loading, error, reset } = useApiMutation()

  // Dismissing via outside-click/Escape keeps the draft so reopening later
  // in this session picks up where you left off. Only Cancel discards it.
  const handleCancel = () => {
    setForm(EMPTY_FORM)
    reset()
    setOpen(false)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const success = await mutate({
      path: `/api/v1/hrms/profiles/${profileId}/educational-backgrounds`,
      method: "POST",
      body: form,
    })

    if (!success) return

    onCreated()
    setForm(EMPTY_FORM)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-3.5 w-3.5" />
          Add
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>New educational background</DialogTitle>
          <DialogDescription>
            Add a degree record for this employee.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
