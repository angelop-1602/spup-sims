"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { useApiQuery, useApiMutation } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { PermissionGuard } from "@/components/auth/permission-guard"
import { useHrmAuth } from "@/components/auth/hrm-auth-guard"
import { ApplicantDateFilters } from "@/components/hrm/applicants/applicant-date-filters"
import { ApplicantRowActions } from "@/components/hrm/applicants/applicant-row-actions"
import { ApplicantStatusBadge } from "@/components/hrm/applicants/applicant-status-badge"
import { DataPagination } from "@/components/hrm/data-pagination"
import { DataSearchInput } from "@/components/hrm/data-search-input"
import { DataTableState } from "@/components/hrm/data-table-state"
import { DataToolbar } from "@/components/hrm/data-toolbar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { EmptyState } from "@/components/ui/empty-state"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Skeleton } from "@/components/ui/skeleton"
import { TableSkeletonRows } from "@/components/ui/table-skeleton-rows"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { notifyCreated } from "@/lib/notifications"

interface Applicant {
  id: number | string
  profileId: number | string
  applicationNumber: string
  status: string
  createdAt: string
  updatedAt: string | null
}

interface Profile {
  id: number | string
  firstName: string
  lastName: string
}

type PagedResponseBase = {
  page: number | string
  pageSize: number | string
  totalRecords: number | string
  totalPages: number | string
  success?: boolean
  message?: string
}

type ApplicantsPayload = PagedResponseBase & { data: Applicant[] }
type ProfilesPayload = PagedResponseBase & { data: Profile[] }

const STATUS_OPTIONS = ["Submitted", "Pending", "Interview", "Hired", "Rejected"]

function formatDate(dateString: string | null) {
  if (!dateString) return "—"
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  })
}

const PAGE_SIZE = 20
const EMPTY_APPLICANTS: Applicant[] = []
const EMPTY_PROFILES: Profile[] = []
export default function ApplicantsPage() {
  const router = useRouter()
  const { hasPermission } = useHrmAuth()

  const canCreate = hasPermission("hrms.recruitment.applicants.create")
  const canProcess = hasPermission("hrms.recruitment.applicants.process")
  const canUpdate =
    canProcess || hasPermission("hrms.recruitment.applicants.update")
  const canDelete = hasPermission("hrms.recruitment.applicants.delete")

  const [search, setSearch] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [dateFrom, setDateFrom] = React.useState("")
  const [dateTo, setDateTo] = React.useState("")
  const [page, setPage] = React.useState(1)

  // Create dialog
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const [createForm, setCreateForm] = React.useState({ profileId: "", status: "Submitted" })
  const [createError, setCreateError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(1)
    }, 200)
    return () => clearTimeout(timeout)
  }, [search])

  const {
    data: applicantsPayload,
    loading: isLoading,
    error,
    refresh: refreshApplicants,
  } = useApiQuery<ApplicantsPayload>("/api/v1/recruitment/employee-applicants", {
    Page: page,
    PageSize: PAGE_SIZE,
    Search: debouncedSearch || undefined,
    DateFrom: dateFrom || undefined,
    DateTo: dateTo || undefined,
    Descending: true,
    SchoolYearId: 1,
  })

  const { data: profilesPayload } = useApiQuery<ProfilesPayload>("/api/v1/core/profiles", {
    Page: 1,
    PageSize: 100,
  })

  const { mutate: createApplicant, loading: creating } = useApiMutation()

  const applicants = applicantsPayload?.data ?? EMPTY_APPLICANTS
  const profiles = profilesPayload?.data ?? EMPTY_PROFILES
  const totalPages = Number(applicantsPayload?.totalPages ?? 1)
  const totalRecords = Number(applicantsPayload?.totalRecords ?? 0)
  const hasActiveFilters = Boolean(search.trim() || dateFrom || dateTo)
  const activeDateFilterCount = Number(Boolean(dateFrom)) + Number(Boolean(dateTo))
  const profileNames = React.useMemo(
    () =>
      new Map(
        profiles.map((profile) => [
          String(profile.id),
          `${profile.firstName} ${profile.lastName}`,
        ]),
      ),
    [profiles],
  )

  function clearFilters() {
    setSearch("")
    setDebouncedSearch("")
    setDateFrom("")
    setDateTo("")
    setPage(1)
  }

  function clearSearch() {
    setSearch("")
    setDebouncedSearch("")
    setPage(1)
  }

  function updateDateFrom(value: string) {
    setDateFrom(value)
    setPage(1)
  }

  function updateDateTo(value: string) {
    setDateTo(value)
    setPage(1)
  }

  function viewApplicant(applicant: Applicant) {
    router.push(
      `/hrm/profiles/${applicant.profileId}?status=${encodeURIComponent(applicant.status)}&applicantId=${applicant.id}`,
    )
  }

  function openCreateDialog() {
    setIsCreateOpen(true)
    setCreateError(null)
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setCreateError(null)
    const ok = await createApplicant({
      path: "/api/v1/recruitment/employee-applicants",
      method: "POST",
      body: {
        profileId: Number(createForm.profileId),
        status: createForm.status,
      },
    })
    if (!ok) {
      setCreateError("Unable to create applicant.")
      return
    }
    await refreshApplicants()
    setIsCreateOpen(false)
    setCreateForm({ profileId: "", status: "Submitted" })
    notifyCreated("Applicant record")
  }

  return (
    <PermissionGuard requiredPermission="hrms.recruitment.applicants.view">
      <div>
        <h1 className="sr-only">Applicants</h1>
        <DataToolbar
          label="Applicant list controls"
          search={
            <Field>
              <FieldLabel htmlFor="applicant-search">Search applicants</FieldLabel>
              <DataSearchInput
                id="applicant-search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value)
                  setPage(1)
                }}
                onClear={clearSearch}
                clearLabel="Clear applicant search"
                placeholder="Application number or status"
                autoComplete="off"
              />
            </Field>
          }
          filters={
            <ApplicantDateFilters
              idPrefix="applicant-desktop"
              dateFrom={dateFrom}
              dateTo={dateTo}
              onDateFromChange={updateDateFrom}
              onDateToChange={updateDateTo}
            />
          }
          mobileFilters={
            <ApplicantDateFilters
              idPrefix="applicant-mobile"
              dateFrom={dateFrom}
              dateTo={dateTo}
              onDateFromChange={updateDateFrom}
              onDateToChange={updateDateTo}
              stacked
            />
          }
          activeFilterCount={activeDateFilterCount}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearFilters}
          actions={
            canCreate ? (
              <Button onClick={openCreateDialog}>
                <Plus aria-hidden="true" />
                New applicant
              </Button>
            ) : undefined
          }
        />

        <DataTableState
          className="mt-4"
          loading={isLoading}
          loadingLabel="Loading applicants"
          error={error}
          onRetry={refreshApplicants}
          empty={applicants.length === 0}
          emptyState={
            <EmptyState
              variant={hasActiveFilters ? "no-results" : "no-records"}
              title={hasActiveFilters ? "No applicants match your filters" : "No applicants yet"}
              description={
                hasActiveFilters
                  ? "Try adjusting your search or applied date range."
                  : "Applicants you add will show up here."
              }
              className="min-h-72 border-0"
              actions={
                hasActiveFilters ? (
                  <Button size="sm" variant="outline" onClick={clearFilters}>
                    Clear filters
                  </Button>
                ) : canCreate ? (
                  <Button size="sm" onClick={openCreateDialog}>
                    <Plus aria-hidden="true" />
                    New applicant
                  </Button>
                ) : undefined
              }
            />
          }
        >
          <div className="hidden md:block">
            <Table className="min-w-3xl text-sm">
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="px-4">Application number</TableHead>
                  <TableHead className="px-4">Applicant name</TableHead>
                  <TableHead className="px-4">Status</TableHead>
                  <TableHead className="px-4">Date applied</TableHead>
                  <TableHead className="px-4">Last updated</TableHead>
                  <TableHead className="px-4 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableSkeletonRows columns={6} rows={8} />
                ) : (
                  applicants.map((applicant) => {
                    const fullName =
                      profileNames.get(String(applicant.profileId)) ?? "No linked profile"

                    return (
                      <TableRow key={applicant.id}>
                        <TableCell className="h-11 px-4 font-medium">
                          {applicant.applicationNumber}
                        </TableCell>
                        <TableCell className="max-w-64 truncate px-4">
                          {fullName}
                        </TableCell>
                        <TableCell className="px-4">
                          <ApplicantStatusBadge status={applicant.status} />
                        </TableCell>
                        <TableCell className="px-4 text-muted-foreground">
                          {formatDate(applicant.createdAt)}
                        </TableCell>
                        <TableCell className="px-4 text-muted-foreground">
                          {formatDate(applicant.updatedAt)}
                        </TableCell>
                        <TableCell className="px-4 text-right">
                          <ApplicantRowActions
                            applicant={applicant}
                            applicantLabel={applicant.applicationNumber}
                            canEdit={canUpdate}
                            canDelete={canDelete}
                            idPrefix="desktop"
                            onView={() => viewApplicant(applicant)}
                            onChanged={refreshApplicants}
                          />
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          <ul role="list" className="divide-y md:hidden">
            {isLoading
              ? Array.from({ length: 5 }, (_, index) => (
                  <li key={index} className="space-y-3 p-4" aria-hidden="true">
                    <div className="flex items-center justify-between gap-3">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-44" />
                    <Skeleton className="h-4 w-full" />
                  </li>
                ))
              : applicants.map((applicant) => {
                  const fullName =
                    profileNames.get(String(applicant.profileId)) ?? "No linked profile"

                  return (
                    <li key={applicant.id} className="space-y-3 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-medium break-words">
                            {applicant.applicationNumber}
                          </p>
                          <p className="mt-1 truncate text-sm text-muted-foreground">
                            {fullName}
                          </p>
                        </div>
                        <ApplicantStatusBadge status={applicant.status} />
                      </div>
                      <dl className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <dt className="text-xs text-muted-foreground">Date applied</dt>
                          <dd className="mt-0.5">{formatDate(applicant.createdAt)}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-muted-foreground">Last updated</dt>
                          <dd className="mt-0.5">{formatDate(applicant.updatedAt)}</dd>
                        </div>
                      </dl>
                      <div className="flex justify-end border-t pt-3">
                        <ApplicantRowActions
                          applicant={applicant}
                          applicantLabel={applicant.applicationNumber}
                          canEdit={canUpdate}
                          canDelete={canDelete}
                          idPrefix="mobile"
                          onView={() => viewApplicant(applicant)}
                          onChanged={refreshApplicants}
                        />
                      </div>
                    </li>
                  )
                })}
          </ul>
        </DataTableState>

        {!isLoading && !error && applicants.length > 0 ? (
          <DataPagination
            className="mt-4"
            page={page}
            pageSize={PAGE_SIZE}
            totalPages={totalPages}
            totalRecords={totalRecords}
            itemLabel={totalRecords === 1 ? "applicant" : "applicants"}
            onPageChange={setPage}
          />
        ) : null}

        <Dialog
          open={isCreateOpen}
          onOpenChange={(open) => {
            setIsCreateOpen(open)
            if (!open) setCreateError(null)
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New applicant</DialogTitle>
              <DialogDescription>Register a new job applicant by linking to an existing profile.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <Field>
                <FieldLabel htmlFor="create-profile">Profile</FieldLabel>
                <select
                  id="create-profile"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
                  value={createForm.profileId}
                  onChange={(e) => setCreateForm((s) => ({ ...s, profileId: e.target.value }))}
                  required
                >
                  <option value="">Select a profile…</option>
                  {profiles.map((p) => (
                    <option key={String(p.id)} value={String(p.id)}>
                      {p.firstName} {p.lastName}
                    </option>
                  ))}
                </select>
              </Field>
              <Field>
                <FieldLabel htmlFor="create-status">Initial status</FieldLabel>
                <select
                  id="create-status"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
                  value={createForm.status}
                  onChange={(e) => setCreateForm((s) => ({ ...s, status: e.target.value }))}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </Field>
              <FieldError>{createError}</FieldError>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="min-w-32" disabled={creating}>
                  {creating ? "Creating…" : "Create applicant"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </PermissionGuard>
  )
}
