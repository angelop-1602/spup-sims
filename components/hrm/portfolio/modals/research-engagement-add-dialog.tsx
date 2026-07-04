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

type ResearchEngagementForm = components["schemas"]["ResearchEngagementRequest"]

const EMPTY_FORM: ResearchEngagementForm = {
  researchTitle: "",
  natureEngagement: "",
  natureUtilization: null,
  datePublished: null,
  attachment: null,
}

export function ResearchEngagementAddDialog({
  profileId,
  onCreated,
}: {
  profileId: number | string
  onCreated: () => void
}) {
  const [open, setOpen] = React.useState(false)
  const [form, setForm] = React.useState<ResearchEngagementForm>(EMPTY_FORM)
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
      path: `/api/v1/hrms/profiles/${profileId}/research-engagements`,
      method: "POST",
      body: form,
    })

    if (!success) {
      setError(new Error("Unable to create research engagement"))
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
          <DialogTitle>New research / creative work</DialogTitle>
          <DialogDescription>
            Add a research or creative work record for this employee.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Research Title</label>
            <Input
              value={form.researchTitle}
              onChange={(event) =>
                setForm((current) => ({ ...current, researchTitle: event.target.value }))
              }
              placeholder="e.g. Impact of Remote Work on Productivity"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Nature of Engagement</label>
            <Input
              value={form.natureEngagement}
              onChange={(event) =>
                setForm((current) => ({ ...current, natureEngagement: event.target.value }))
              }
              placeholder="e.g. Author, Co-author, Reviewer"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Nature of Utilization</label>
            <Input
              value={form.natureUtilization ?? ""}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  natureUtilization: event.target.value || null,
                }))
              }
              placeholder="Optional"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Date Published</label>
            <Input
              type="date"
              value={form.datePublished ?? ""}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  datePublished: event.target.value || null,
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
