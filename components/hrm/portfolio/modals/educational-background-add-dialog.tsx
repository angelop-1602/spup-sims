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

type EducationalBackgroundForm = components["schemas"]["EducationalBackgroundRequest"]
type EducationCredentialForm = components["schemas"]["EducationCredentialRequest"]

const EMPTY_FORM: EducationalBackgroundForm = {
  educationId: null,
  degreeLevel: "",
  degree: "",
  institution: "",
  dateGraduated: null,
}

const EMPTY_CREDENTIALS = {
  diploma: "",
  transcriptOfRecords: "",
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
  const [credentials, setCredentials] = React.useState(EMPTY_CREDENTIALS)
  const { headers } = useAuthorizedHeaders()
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<Error | null>(null)

  // Dismissing via outside-click/Escape keeps the draft so reopening later
  // in this session picks up where you left off. Only Cancel discards it.
  const handleCancel = () => {
    setForm(EMPTY_FORM)
    setCredentials(EMPTY_CREDENTIALS)
    setError(null)
    setOpen(false)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const created = await request<components["schemas"]["EducationalBackgroundResponse"]>(
        `/api/v1/hrms/profiles/${profileId}/educational-backgrounds`,
        headers,
        { method: "POST", body: form },
      )

      const credentialBody: EducationCredentialForm = {
        educationalBackgroundId: created.id,
        diploma: credentials.diploma || null,
        transcriptOfRecords: credentials.transcriptOfRecords || null,
      }

      await request(
        `/api/v1/hrms/profiles/${profileId}/education-credentials`,
        headers,
        { method: "POST", body: credentialBody },
      )

      onCreated()
      setForm(EMPTY_FORM)
      setCredentials(EMPTY_CREDENTIALS)
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

          <div>
            <label className="mb-2 block text-sm font-medium">Diploma</label>
            <Input
              type="file"
              accept="image/*,.pdf"
              onChange={async (event) => {
                const file = event.target.files?.[0]
                if (!file) return
                const dataUrl = await readFileAsDataUrl(file)
                setCredentials((current) => ({ ...current, diploma: dataUrl }))
              }}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Transcript of Records</label>
            <Input
              type="file"
              accept="image/*,.pdf"
              onChange={async (event) => {
                const file = event.target.files?.[0]
                if (!file) return
                const dataUrl = await readFileAsDataUrl(file)
                setCredentials((current) => ({ ...current, transcriptOfRecords: dataUrl }))
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
