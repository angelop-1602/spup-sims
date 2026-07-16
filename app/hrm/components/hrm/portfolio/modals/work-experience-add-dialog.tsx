"use client"

import * as React from "react"
import { CalendarIcon, Plus } from "lucide-react"
import { addDays, format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
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
import { request, useAuthorizedHeaders, type components } from "@/lib/api"
import { cn } from "@/lib/utils"

type WorkExperienceForm = Omit<components["schemas"]["WorkExperienceRequest"], "attachment">

const EMPTY_FORM: WorkExperienceForm = {
  jobTitle: "",
  institution: "",
  startDate: "",
  endDate: null,
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
      const created = await request<components["schemas"]["WorkExperienceResponse"]>(
        `/api/v1/hrms/profiles/${profileId}/work-experiences`,
        headers,
        { method: "POST", body: form },
      )

      if (attachmentFile) {
        const formData = new FormData()
        formData.append("file", attachmentFile)
        await request(
          `/api/v1/hrms/profiles/${profileId}/work-experiences/${created.id}/attachment`,
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
          <DialogTitle>New work experience</DialogTitle>
          <DialogDescription>
            Add an employment record for this employee.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
