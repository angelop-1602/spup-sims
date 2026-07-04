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
import { readFileAsDataUrl } from "@/lib/utils"

type WorkExperienceForm = components["schemas"]["WorkExperienceRequest"]

const EMPTY_FORM: WorkExperienceForm = {
  jobTitle: "",
  institution: "",
  startDate: "",
  endDate: null,
  attachment: null,
}

export function WorkExperienceAddDialog({
  profileId,
  onCreated,
}: {
  profileId: number | string
  onCreated: () => void
}) {
  const [open, setOpen] = React.useState(false)
  const [form, setForm] = React.useState<WorkExperienceForm>(EMPTY_FORM)
  const { mutate, loading } = useApiMutation()
  const [error, setError] = React.useState<Error | null>(null)

  // Dismissing via outside-click/Escape keeps the draft so reopening later
  // in this session picks up where you left off. Only Cancel discards it.
  const handleCancel = () => {
    setForm(EMPTY_FORM)
    setError(null)
    setOpen(false)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    const success = await mutate({
      path: `/api/v1/hrms/profiles/${profileId}/work-experiences`,
      method: "POST",
      body: form,
    })

    if (!success) {
      setError(new Error("Unable to create work experience"))
      return
    }

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
          <DialogTitle>New work experience</DialogTitle>
          <DialogDescription>
            Add an employment record for this employee.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Job Title</label>
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
            <label className="mb-2 block text-sm font-medium">Institution</label>
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
            <label className="mb-2 block text-sm font-medium">Start Date</label>
            <Input
              type="date"
              value={form.startDate}
              onChange={(event) =>
                setForm((current) => ({ ...current, startDate: event.target.value }))
              }
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">End Date</label>
            <Input
              type="date"
              value={form.endDate ?? ""}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  endDate: event.target.value || null,
                }))
              }
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
