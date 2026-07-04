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
import { request, useAuthorizedHeaders, type components } from "@/lib/api"
import { readFileAsDataUrl } from "@/lib/utils"

type CommunityInvolvementForm = components["schemas"]["CommunityInvolvementRequest"]

const EMPTY_FORM: CommunityInvolvementForm = {
  involvement: "",
  natureInvolvement: "",
  dateActivity: "",
  attachment: null,
}

export function CommunityInvolvementAddDialog({
  profileId,
  onCreated,
}: {
  profileId: number | string
  onCreated: () => void
}) {
  const [open, setOpen] = React.useState(false)
  const [form, setForm] = React.useState<CommunityInvolvementForm>(EMPTY_FORM)
  const { headers } = useAuthorizedHeaders()
  const [loading, setLoading] = React.useState(false)
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
    setLoading(true)
    setError(null)

    try {
      await request(
        `/api/v1/hrms/profiles/${profileId}/community-involvements`,
        headers,
        { method: "POST", body: form },
      )

      onCreated()
      setForm(EMPTY_FORM)
      setOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setLoading(false)
    }
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
          <DialogTitle>New community / parish involvement</DialogTitle>
          <DialogDescription>
            Add a community involvement record for this employee.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Involvement</label>
            <Input
              value={form.involvement}
              onChange={(event) =>
                setForm((current) => ({ ...current, involvement: event.target.value }))
              }
              placeholder="e.g. Outreach Program"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Nature of Involvement</label>
            <Input
              value={form.natureInvolvement}
              onChange={(event) =>
                setForm((current) => ({ ...current, natureInvolvement: event.target.value }))
              }
              placeholder="e.g. Volunteer, Organizer"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Date of Activity</label>
            <Input
              type="date"
              value={form.dateActivity}
              onChange={(event) =>
                setForm((current) => ({ ...current, dateActivity: event.target.value }))
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
