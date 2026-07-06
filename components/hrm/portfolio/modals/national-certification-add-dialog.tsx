"use client"

import * as React from "react"
import { Info, Plus } from "lucide-react"
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { request, useAuthorizedHeaders, type components } from "@/lib/api"

type NationalBoardForm = Omit<components["schemas"]["NationalBoardRequest"], "attachment">

const EMPTY_FORM: NationalBoardForm = {
  certification: "",
  rating: null,
  licenseNumber: "",
  validity: null,
  remarks: null,
}

export function NationalCertificationAddDialog({
  profileId,
  onCreated,
}: {
  profileId: number | string
  onCreated: () => void
}) {
  const [open, setOpen] = React.useState(false)
  const [form, setForm] = React.useState<NationalBoardForm>(EMPTY_FORM)
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
      const created = await request<components["schemas"]["NationalBoardResponse"]>(
        `/api/v1/hrms/profiles/${profileId}/national-boards`,
        headers,
        { method: "POST", body: form },
      )

      if (attachmentFile) {
        const formData = new FormData()
        formData.append("file", attachmentFile)
        await request(
          `/api/v1/hrms/profiles/${profileId}/national-boards/${created.id}/attachment`,
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
          <DialogTitle>New national certification</DialogTitle>
          <DialogDescription>
            Add a board certification record for this employee.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="Rating"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Validity <span className="text-destructive">*</span>
            </label>
            <Input
              type="date"
              value={form.validity ?? ""}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  validity: event.target.value || null,
                }))
              }
              required
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
              placeholder="Remarks"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Attachment <span className="text-destructive">*</span>
            </label>
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
