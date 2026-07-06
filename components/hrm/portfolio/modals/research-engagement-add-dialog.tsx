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

type ResearchEngagementForm = Omit<components["schemas"]["ResearchEngagementRequest"], "attachment">

const EMPTY_FORM: ResearchEngagementForm = {
  researchTitle: "",
  natureEngagement: "",
  natureUtilization: null,
  datePublished: null,
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
      const created = await request<components["schemas"]["ResearchEngagementResponse"]>(
        `/api/v1/hrms/profiles/${profileId}/research-engagements`,
        headers,
        { method: "POST", body: form },
      )

      if (attachmentFile) {
        const formData = new FormData()
        formData.append("file", attachmentFile)
        await request(
          `/api/v1/hrms/profiles/${profileId}/research-engagements/${created.id}/attachment`,
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
          <DialogTitle>New research / creative work</DialogTitle>
          <DialogDescription>
            Add a research or creative work record for this employee.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Research Title <span className="text-destructive">*</span>
            </label>
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
            <label className="mb-2 flex items-center gap-1 text-sm font-medium">
              <span>Nature of Engagement</span>
              <span className="text-destructive">*</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info size={14} className="shrink-0" />
                </TooltipTrigger>
                <TooltipContent>Sole or Co-author</TooltipContent>
              </Tooltip>
            </label>
            <Input
              value={form.natureEngagement}
              onChange={(event) =>
                setForm((current) => ({ ...current, natureEngagement: event.target.value }))
              }
              placeholder="e.g. Sole Author, Co-author"
              required
            />
          </div>

          <div>
            <label className="mb-2 flex items-center gap-1 text-sm font-medium">
              <span>Nature of Utilization</span>
              <span className="text-destructive">*</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info size={14} className="shrink-0" />
                </TooltipTrigger>
                <TooltipContent>Published/Presented/Patented/Copyrighted - Provide details.</TooltipContent>
              </Tooltip>
            </label>
            <Input
              value={form.natureUtilization ?? ""}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  natureUtilization: event.target.value || null,
                }))
              }
              placeholder="e.g. Published, Presented, Patented, Copyrighted"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Date Published <span className="text-destructive">*</span>
            </label>
            <Input
              type="date"
              value={form.datePublished ?? ""}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  datePublished: event.target.value || null,
                }))
              }
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
