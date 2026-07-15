"use client"

import * as React from "react"
import { CalendarIcon, Info, Plus } from "lucide-react"
import { format } from "date-fns"
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
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { request, useAuthorizedHeaders, type components } from "@/lib/api"
import { EDUCATIONAL_ATTAINMENT_OPTIONS } from "@/components/hrm/portfolio/educational-attainment-options"
import { DEGREE_LEVEL_OPTIONS } from "@/components/hrm/portfolio/degree-level-options"

type EducationalBackgroundForm = Omit<components["schemas"]["EducationalBackgroundRequest"], "educationalAttainment"> & {
  educationalAttainment: string | null
}

const EMPTY_FORM: EducationalBackgroundForm = {
  educationId: null,
  educationalAttainment: "",
  degreeLevel: "",
  degree: "",
  institution: "",
  dateGraduated: null,
  diploma: null,
  tor: null,
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
  const [datePickerOpen, setDatePickerOpen] = React.useState(false)
  const [isGraduated, setIsGraduated] = React.useState(true)
  const [diplomaFile, setDiplomaFile] = React.useState<File | null>(null)
  const [torFile, setTorFile] = React.useState<File | null>(null)
  const { headers } = useAuthorizedHeaders()
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<Error | null>(null)
  const attachmentsRequired =
    form.educationalAttainment === "Graduate" || form.educationalAttainment === "Postgraduate"
  const degreeLevelOptions = form.educationalAttainment
    ? DEGREE_LEVEL_OPTIONS[form.educationalAttainment] ?? []
    : []
  const isTertiary = form.educationalAttainment === "Tertiary"
  const isPostgraduate = form.educationalAttainment === "Postgraduate"
  const showUnitsEarned = isTertiary || (isPostgraduate && !isGraduated)
  const dateRequired =
    form.educationalAttainment === "Elementary"
      ? form.degreeLevel === "Grade 6"
      : form.educationalAttainment === "Secondary"
        ? form.degreeLevel === "Grade 10" || form.degreeLevel === "Grade 12"
        : true
  const dateDisabled =
    (form.educationalAttainment === "Elementary" || form.educationalAttainment === "Secondary") &&
    !dateRequired

  // Dismissing via outside-click/Escape keeps the draft so reopening later
  // in this session picks up where you left off. Only Cancel discards it.
  const handleCancel = () => {
    setForm(EMPTY_FORM)
    setDiplomaFile(null)
    setTorFile(null)
    setError(null)
    setDatePickerOpen(false)
    setIsGraduated(true)
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

      if (diplomaFile) {
        const formData = new FormData()
        formData.append("file", diplomaFile)
        await request(
          `/api/v1/hrms/profiles/${profileId}/educational-backgrounds/${created.id}/diploma`,
          headers,
          { method: "POST", body: formData },
        )
      }

      if (torFile) {
        const formData = new FormData()
        formData.append("file", torFile)
        await request(
          `/api/v1/hrms/profiles/${profileId}/educational-backgrounds/${created.id}/tor`,
          headers,
          { method: "POST", body: formData },
        )
      }

      onCreated()
      setForm(EMPTY_FORM)
      setDiplomaFile(null)
      setTorFile(null)
      setIsGraduated(true)
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
            <label className="mb-2 block text-sm font-medium">
              Educational Attainment <span className="text-destructive">*</span>
            </label>
            <Select
              value={form.educationalAttainment ?? ""}
              onValueChange={(value) => {
                setIsGraduated(true)
                setForm((current) => {
                  const noDegree = value === "Elementary" || value === "Secondary"
                  const wasNoDegree =
                    current.educationalAttainment === "Elementary" ||
                    current.educationalAttainment === "Secondary"
                  return {
                    ...current,
                    educationalAttainment: value,
                    degreeLevel: "",
                    degree: noDegree ? "N/A" : wasNoDegree ? "" : current.degree,
                    dateGraduated: null,
                  }
                })
              }}
              required
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select attainment" />
              </SelectTrigger>
              <SelectContent
                position="popper"
                side="bottom"
                avoidCollisions={false}
                onCloseAutoFocus={(event) => event.preventDefault()}
              >
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
              Educational Level {<span className="text-destructive">*</span>}
            </label>
            {form.educationalAttainment === "Vocational" ? (
              <Input
                value={form.degreeLevel ?? ""}
                onChange={(event) =>
                  setForm((current) => ({ ...current, degreeLevel: event.target.value }))
                }
                placeholder="e.g. Culinary Arts NC II"
                required
              />
            ) : (
              <Select
                value={form.degreeLevel ?? ""}
                onValueChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    degreeLevel: value,
                    dateGraduated:
                      current.educationalAttainment === "Elementary" ||
                      current.educationalAttainment === "Secondary"
                        ? null
                        : current.dateGraduated,
                  }))
                }
                disabled={degreeLevelOptions.length === 0}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select educational level" />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  side="bottom"
                  avoidCollisions={false}
                  onCloseAutoFocus={(event) => event.preventDefault()}
                >
                  {degreeLevelOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
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
              disabled={["Elementary", "Secondary"].includes(form.educationalAttainment ?? "")}
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
              placeholder="Institution"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              {showUnitsEarned ? "Units Earned" : "Date Graduated"}{" "}
              {dateRequired && <span className="text-destructive">*</span>}
            </label>

            {isPostgraduate && (
              <div className="mb-2 flex items-center gap-2 text-sm">
                <Checkbox
                  checked={isGraduated}
                  onCheckedChange={(checked) => {
                    setIsGraduated(checked === true)
                    setForm((current) => ({ ...current, dateGraduated: null }))
                  }}
                />
                <span>Graduated</span>
              </div>
            )}

            {showUnitsEarned ? (
              <Input
                type="number"
                value={form.dateGraduated ?? ""}
                onChange={(event) =>
                  setForm((current) => ({ ...current, dateGraduated: event.target.value }))
                }
                placeholder="e.g. 120"
                required={dateRequired}
              />
            ) : (
              <>
                <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={dateDisabled}
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
                      onSelect={(date) => {
                        setForm((current) => ({
                          ...current,
                          dateGraduated: date ? format(date, "yyyy-MM-dd") : null,
                        }))
                        setDatePickerOpen(false)
                      }}
                      captionLayout="dropdown"
                      disabled={{ after: new Date() }}
                    />
                  </PopoverContent>
                </Popover>
                <input
                  type="text"
                  value={form.dateGraduated ?? ""}
                  onChange={() => {}}
                  required={dateRequired}
                  disabled={dateDisabled}
                  className="sr-only"
                  tabIndex={-1}
                />
              </>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Diploma {attachmentsRequired && <span className="text-destructive">*</span>}
            </label>
            <Input
              type="file"
              accept="image/*,.pdf"
              onChange={(event) => {
                setDiplomaFile(event.target.files?.[0] ?? null)
              }}
              required={attachmentsRequired}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Transcript of Records (TOR) {attachmentsRequired && <span className="text-destructive">*</span>}
            </label>
            <Input
              type="file"
              accept="image/*,.pdf"
              onChange={(event) => {
                setTorFile(event.target.files?.[0] ?? null)
              }}
              required={attachmentsRequired}
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
