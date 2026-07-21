"use client"

import * as React from "react"
import { PermissionGuard } from "@/components/auth/permission-guard"
import { useHrmAuth } from "@/components/auth/hrm-auth-guard"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Edit3, Loader2, Plus, Search, Send, Trash2, XCircle } from "lucide-react"
import {
  useApiQuery,
  useApiMutation,
  type JobPostingResponse,
  type PagedResponseOfJobPostingResponse,
  type PagedResponseOfDepartmentResponse,
  type CreateJobPostingRequest,
  type UpdateJobPostingRequest,
} from "@/lib/api"
import { ApiErrorView } from "@/components/ui/api-error-view"

// Mirrors SIS.Domain.Platform.JobPostingStatus. The API serializes this enum as its
// member name (e.g. "Draft"), so status is compared/keyed by name, not ordinal.
const STATUS_STYLE: Record<string, string> = {
  Draft: "bg-zinc-100 text-zinc-700",
  Published: "bg-green-50 text-green-700",
  Closed: "bg-blue-50 text-blue-700",
  Cancelled: "bg-red-50 text-red-700",
}

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: "All", value: "" },
  { label: "Draft", value: "Draft" },
  { label: "Published", value: "Published" },
  { label: "Closed", value: "Closed" },
  { label: "Cancelled", value: "Cancelled" },
]

const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Temporary"]

const EMPTY_FORM: CreateJobPostingRequest = {
  title: "",
  departmentId: undefined,
  description: null,
  requirements: null,
  location: null,
  employmentType: null,
  vacancyCount: null,
  applicationDeadline: null,
}

const PAGE_SIZE = 20

export default function JobPostingsPage() {
  const { hasPermission } = useHrmAuth()

  const canCreate = hasPermission("hrms.recruitment.job-postings.create")
  const canUpdate = hasPermission("hrms.recruitment.job-postings.update")
  const canDelete = hasPermission("hrms.recruitment.job-postings.delete")

  const [search, setSearch] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("")
  const [page, setPage] = React.useState(1)

  const [formState, setFormState] = React.useState<CreateJobPostingRequest>(EMPTY_FORM)
  const [selectedPosting, setSelectedPosting] = React.useState<JobPostingResponse | null>(null)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [busyId, setBusyId] = React.useState<number | string | null>(null)

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(1)
    }, 200)
    return () => clearTimeout(timeout)
  }, [search])

  const handleError = React.useCallback((err: Error) => setError(err.message), [])

  const { data, loading, refresh, error: queryError } = useApiQuery<PagedResponseOfJobPostingResponse>(
    "/api/v1/hrms/job-postings",
    {
      Page: page,
      PageSize: PAGE_SIZE,
      Search: debouncedSearch || undefined,
      SortBy: "id",
      Descending: true,
      Status: statusFilter === "" ? undefined : statusFilter,
    },
    { onError: handleError },
  )

  const { data: departmentsData } = useApiQuery<PagedResponseOfDepartmentResponse>(
    "/api/v1/organization/departments",
    { Page: 1, PageSize: 200, SortBy: "name" },
  )

  const postings = data?.data ?? []
  const departments = departmentsData?.data ?? []
  const totalPages = Number(data?.totalPages ?? 1)
  const totalRecords = Number(data?.totalRecords ?? 0)

  const resetForm = React.useCallback(() => {
    setSelectedPosting(null)
    setFormState(EMPTY_FORM)
  }, [])

  const openCreateDialog = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const openEditDialog = (posting: JobPostingResponse) => {
    setSelectedPosting(posting)
    setFormState({
      title: posting.title ?? "",
      departmentId: posting.departmentId ?? undefined,
      description: posting.description ?? null,
      requirements: posting.requirements ?? null,
      location: posting.location ?? null,
      employmentType: posting.employmentType ?? null,
      vacancyCount: posting.vacancyCount ?? null,
      applicationDeadline: posting.applicationDeadline ?? null,
    })
    setIsDialogOpen(true)
  }

  const { mutate: saveJobPosting, loading: savingMutation } = useApiMutation()

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError(null)

    const path = selectedPosting
      ? `/api/v1/hrms/job-postings/${selectedPosting.id}`
      : "/api/v1/hrms/job-postings"

    const body: CreateJobPostingRequest | UpdateJobPostingRequest = {
      title: formState.title,
      departmentId: formState.departmentId || undefined,
      description: formState.description || null,
      requirements: formState.requirements || null,
      location: formState.location || null,
      employmentType: formState.employmentType || null,
      vacancyCount: formState.vacancyCount || null,
      applicationDeadline: formState.applicationDeadline || null,
    }

    const ok = await saveJobPosting({
      path,
      method: selectedPosting ? "PUT" : "POST",
      body,
    })

    setSaving(false)
    if (!ok) { setError("Unable to save job posting"); return }
    await refresh()
    resetForm()
    setIsDialogOpen(false)
  }

  const { mutate: deleteJobPosting, loading: deletingMutation } = useApiMutation()

  const handleDelete = async (posting: JobPostingResponse) => {
    setBusyId(posting.id ?? null)
    setError(null)
    const ok = await deleteJobPosting({
      path: `/api/v1/hrms/job-postings/${posting.id}`,
      method: "DELETE",
    })
    setBusyId(null)
    if (!ok) { setError("Unable to delete job posting"); return }
    await refresh()
  }

  const { mutate: transitionJobPosting } = useApiMutation()

  const handlePublish = async (posting: JobPostingResponse) => {
    setBusyId(posting.id ?? null)
    setError(null)
    const ok = await transitionJobPosting({
      path: `/api/v1/hrms/job-postings/${posting.id}/publish`,
      method: "POST",
    })
    setBusyId(null)
    if (!ok) { setError("Unable to publish job posting"); return }
    await refresh()
  }

  const handleClose = async (posting: JobPostingResponse) => {
    setBusyId(posting.id ?? null)
    setError(null)
    const ok = await transitionJobPosting({
      path: `/api/v1/hrms/job-postings/${posting.id}/close`,
      method: "POST",
    })
    setBusyId(null)
    if (!ok) { setError("Unable to close job posting"); return }
    await refresh()
  }

  return (
    <PermissionGuard requiredPermission="hrms.recruitment.job-postings.view">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Job Postings</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Create and manage job postings. Publish a draft to make it visible to applicants.
            </p>
          </div>
          {canCreate && (
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              New job posting
            </Button>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-1.5">
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => {
                  setStatusFilter(filter.value)
                  setPage(1)
                }}
                className={
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors " +
                  (statusFilter === filter.value
                    ? "border-foreground bg-foreground text-background"
                    : "border-input text-muted-foreground hover:bg-muted/50")
                }
              >
                {filter.label}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title"
              className="w-64 rounded-md border border-input bg-background py-2 pl-8 pr-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
        </div>

        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Vacancies</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="p-6 text-center">
                    <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading job postings...
                    </span>
                  </TableCell>
                </TableRow>
              ) : queryError ? (
                <TableRow>
                  <TableCell colSpan={7} className="p-0">
                    <ApiErrorView error={queryError} onRetry={refresh} fullScreen />
                  </TableCell>
                </TableRow>
              ) : postings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="p-6 text-center text-sm text-muted-foreground">
                    No job postings available.
                  </TableCell>
                </TableRow>
              ) : (
                postings.map((posting) => {
                  const status = String(posting.status ?? "Draft")
                  const isBusy = busyId === posting.id

                  return (
                    <TableRow key={String(posting.id)}>
                      <TableCell className="font-medium">{posting.title}</TableCell>
                      <TableCell>{posting.department ?? "-"}</TableCell>
                      <TableCell>{posting.employmentType ?? "-"}</TableCell>
                      <TableCell>{posting.vacancyCount ?? "-"}</TableCell>
                      <TableCell>
                        {posting.applicationDeadline
                          ? new Date(posting.applicationDeadline).toLocaleDateString("en-US", {
                              year: "numeric", month: "short", day: "numeric",
                            })
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <span className={"inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium " + (STATUS_STYLE[status] ?? "bg-zinc-100 text-zinc-700")}>
                          {status}
                        </span>
                      </TableCell>
                      <TableCell className="space-x-2 text-right whitespace-nowrap">
                        {canUpdate && status === "Draft" && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isBusy}
                            onClick={() => handlePublish(posting)}
                          >
                            <Send className="mr-2 h-4 w-4" />
                            Publish
                          </Button>
                        )}
                        {canUpdate && status === "Published" && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isBusy}
                            onClick={() => handleClose(posting)}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Close
                          </Button>
                        )}
                        {canUpdate && status !== "Closed" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(posting)}
                          >
                            <Edit3 className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                        )}
                        {canDelete && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete job posting</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action will permanently remove <strong>{posting.title}</strong>.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(posting)}
                                  disabled={isBusy || deletingMutation}
                                >
                                  {isBusy ? "Deleting..." : "Delete"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {!loading && !queryError && postings.length > 0 && (
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages} · {totalRecords} job posting{totalRecords === 1 ? "" : "s"}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-md border px-3 py-1.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50 hover:bg-muted/50"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(Number(totalPages), p + 1))}
                disabled={page >= Number(totalPages)}
                className="rounded-md border px-3 py-1.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50 hover:bg-muted/50"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Create / Edit dialog */}
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm() }}
        >
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{selectedPosting ? "Edit job posting" : "New job posting"}</DialogTitle>
              <DialogDescription>
                {selectedPosting
                  ? "Update the job posting details."
                  : "New postings are created as a draft. Publish when ready for applicants to see."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <Label htmlFor="jp-title">Title <span className="text-destructive">*</span></Label>
                <Input
                  id="jp-title"
                  value={formState.title}
                  onChange={(e) => setFormState((s) => ({ ...s, title: e.target.value }))}
                  placeholder="e.g., Systems Administrator"
                  required
                  maxLength={200}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Department</Label>
                  <Select
                    value={formState.departmentId ? String(formState.departmentId) : ""}
                    onValueChange={(value) => setFormState((s) => ({ ...s, departmentId: value ? Number(value) : undefined }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={String(dept.id)} value={String(dept.id)}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Employment Type</Label>
                  <Select
                    value={formState.employmentType ?? ""}
                    onValueChange={(value) => setFormState((s) => ({ ...s, employmentType: value || null }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {EMPLOYMENT_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="jp-location">Location</Label>
                  <Input
                    id="jp-location"
                    value={formState.location ?? ""}
                    onChange={(e) => setFormState((s) => ({ ...s, location: e.target.value || null }))}
                    placeholder="e.g., Tuguegarao City, Cagayan"
                  />
                </div>
                <div>
                  <Label htmlFor="jp-vacancies">Vacancies</Label>
                  <Input
                    id="jp-vacancies"
                    type="number"
                    min={1}
                    value={formState.vacancyCount ?? ""}
                    onChange={(e) => setFormState((s) => ({ ...s, vacancyCount: e.target.value ? Number(e.target.value) : null }))}
                    placeholder="e.g., 2"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="jp-deadline">Application Deadline</Label>
                <Input
                  id="jp-deadline"
                  type="date"
                  value={formState.applicationDeadline ?? ""}
                  onChange={(e) => setFormState((s) => ({ ...s, applicationDeadline: e.target.value || null }))}
                />
              </div>

              <div>
                <Label htmlFor="jp-description">Description</Label>
                <Textarea
                  id="jp-description"
                  value={formState.description ?? ""}
                  onChange={(e) => setFormState((s) => ({ ...s, description: e.target.value || null }))}
                  placeholder="Describe the role and responsibilities"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="jp-requirements">Requirements</Label>
                <Textarea
                  id="jp-requirements"
                  value={formState.requirements ?? ""}
                  onChange={(e) => setFormState((s) => ({ ...s, requirements: e.target.value || null }))}
                  placeholder="List qualifications and requirements"
                  rows={4}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => { resetForm(); setIsDialogOpen(false) }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving || savingMutation}>
                  {saving || savingMutation ? "Saving..." : selectedPosting ? "Save changes" : "Create job posting"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </PermissionGuard>
  )
}
