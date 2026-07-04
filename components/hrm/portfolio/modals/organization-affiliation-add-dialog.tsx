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

type ProfessionalOrganizationForm = Omit<components["schemas"]["ProfessionalOrganizationRequest"], "attachment">

const EMPTY_FORM: ProfessionalOrganizationForm = {
  affiliation: "",
  membership: "",
  remarks: null,
}

export function OrganizationAffiliationAddDialog({
  profileId,
  onCreated,
}: {
  profileId: number | string
  onCreated: () => void
}) {
  const [open, setOpen] = React.useState(false)
  const [form, setForm] = React.useState<ProfessionalOrganizationForm>(EMPTY_FORM)
  const [attachmentFile, setAttachmentFile] = React.useState<File | null>(null)
  const { headers } = useAuthorizedHeaders()
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<Error | null>(null)

  // Dismissing via outside-click/Escape keeps the draft so reopening later
  // in this session picks up where you left off. Only Cancel discards it.
  const handleCancel = () => {
    setForm(EMPTY_FORM)
    setAttachmentFile(null)
    setError(null)
    setOpen(false)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const created = await request<components["schemas"]["ProfessionalOrganizationResponse"]>(
        `/api/v1/hrms/profiles/${profileId}/professional-organizations`,
        headers,
        { method: "POST", body: form },
      )

      if (attachmentFile) {
        const formData = new FormData()
        formData.append("file", attachmentFile)
        await request(
          `/api/v1/hrms/profiles/${profileId}/professional-organizations/${created.id}/attachment`,
          headers,
          { method: "POST", body: formData },
        )
      }

      onCreated()
      setForm(EMPTY_FORM)
      setAttachmentFile(null)
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
          <DialogTitle>New organization affiliation</DialogTitle>
          <DialogDescription>
            Add a professional organization record for this employee.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Affiliation <span className="text-destructive">*</span>
            </label>
            <Input
              value={form.affiliation}
              onChange={(event) =>
                setForm((current) => ({ ...current, affiliation: event.target.value }))
              }
              placeholder="e.g. Philippine Nurses Association"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Membership <span className="text-destructive">*</span>
            </label>
            <Input
              value={form.membership}
              onChange={(event) =>
                setForm((current) => ({ ...current, membership: event.target.value }))
              }
              placeholder="e.g. Member, Officer"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Remarks</label>
            <Input
              value={form.remarks ?? ""}
              onChange={(event) =>
                setForm((current) => ({ ...current, remarks: event.target.value || null }))
              }
              placeholder="Optional"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Attachment</label>
            <Input
              type="file"
              accept="image/*,.pdf"
              onChange={(event) => {
                setAttachmentFile(event.target.files?.[0] ?? null)
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
