"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Loader2, Search, UserSearch, Eye } from "lucide-react"
import { useApiClient, type components } from "@/lib/api"

interface ApplicantValues {
  Id: number | string
  ProfileId: number | string
  ApplicationNumber: string
  Status: string
  CreatedAt: string
  UpdatedAt: string | null
  DeletedAt: string | null
  CreatedBy: string | null
  UpdatedBy: string | null
  DeletedBy: string | null
  IsDeleted: boolean
}

interface Applicant {
  entity: string
  id: number | string
  values: ApplicantValues
}

interface ProfileValues {
  FirstName: string
  LastName: string
  [key: string]: unknown
}

interface Profile {
  id: number | string
  values: ProfileValues
}

type PagedEntityRecords<TValues> = Omit<
  components["schemas"]["PagedResponseOfEntityRecord"],
  "data"
> & {
  data: Array<Omit<components["schemas"]["EntityRecord"], "values"> & {
    values: TValues
  }>
}

const STATUS_STYLES: Record<string, string> = {
  Interview: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
  Hired: "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20",
  Rejected: "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20",
  Pending: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20",
  Submitted: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20",
}

function getStatusStyle(status: string) {
  return STATUS_STYLES[status] ?? "bg-muted text-muted-foreground border border-border"
}

function formatDate(dateString: string | null) {
  if (!dateString) return "—"
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

const PAGE_SIZE = 20
const EMPTY_APPLICANTS: Applicant[] = []

export default function ApplicantsPage() {
  const router = useRouter()
  const [search, setSearch] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [dateFrom, setDateFrom] = React.useState("")
  const [dateTo, setDateTo] = React.useState("")
  const [page, setPage] = React.useState(1)

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(1)
    }, 200) // 200ms debounce
    return () => clearTimeout(timeout)
  }, [search])

  React.useEffect(() => {
    setPage(1)
  }, [dateFrom, dateTo])

  const {
    data: applicantsPayload,
    loading: isLoading,
    error,
  } = useApiQuery<ApplicantsPayload>("/api/v1/recruitment/employee-applicants", {
    Page: page,
    PageSize: PAGE_SIZE,
    Search: debouncedSearch || undefined,
    DateFrom: dateFrom || undefined,
    DateTo: dateTo || undefined,
    SortBy: "",
    Descending: true,
    SchoolYearId: 1,
    Status: "",
  })

      try {
        const trimmedSearch = search.trim()
        const params = {
          Page: page,
          PageSize: pageSize,
          Search: trimmedSearch || undefined,
          DateFrom: dateFrom || undefined,
          DateTo: dateTo || undefined,
          SortBy: "",
          Descending: true,
          SchoolYearId: 1,
          Status: "",
        }

        const [applicantsPayload, profilesPayload] = await Promise.all([
          query<PagedEntityRecords<ApplicantValues>>(
            "/api/v1/recruitment/employee-applicants",
            params,
          ),
          query<PagedEntityRecords<ProfileValues>>("/api/v1/core/profiles", {
            Page: 1,
            PageSize: 100,
          }),
        ])

        setApplicants(applicantsPayload?.data ?? [])
        setTotalPages(Number(applicantsPayload?.totalPages ?? 1))
        setTotalRecords(Number(applicantsPayload?.totalRecords ?? 0))

        setProfiles(profilesPayload?.data ?? [])
      } catch (error) {
        console.error("Failed to fetch data:", error)
        setApplicants([])
        setProfiles([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchApplicants()
  }, [query, account, page, pageSize, search, dateFrom, dateTo])

    let cancelled = false

    if (term) {
      const matchingProfile = profiles.find((p) => String(p.id) === String(ProfileId))
      const fullName = matchingProfile
        ? `${matchingProfile.values.FirstName} ${matchingProfile.values.LastName}`.toLowerCase()
        : ""
      const matchesSearch =
        ApplicationNumber.toLowerCase().includes(term) ||
        Status.toLowerCase().includes(term) ||
        fullName.includes(term)
      if (!matchesSearch) return false
    }

    return () => {
      cancelled = true
    }
  }, [applicants, query])

  const totalPages = applicantsPayload?.totalPages ?? 1
  const totalRecords = applicantsPayload?.totalRecords ?? 0
  const hasActiveFilters = Boolean(search || dateFrom || dateTo)

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal">Applicants</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Applicant records will appear here.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value)
              setPage(1)
            }}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
          <span className="text-sm text-muted-foreground">to</span>
          <input
            type="date"
            value={dateTo}
            min={dateFrom || undefined}
            onChange={(e) => {
              setDateTo(e.target.value)
              setPage(1)
            }}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
          {(dateFrom || dateTo) && (
            <button
              type="button"
              onClick={() => {
                setDateFrom("")
                setDateTo("")
                setPage(1)
              }}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          )}
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Search application no. or status"
              className="w-64 rounded-md border border-input bg-background py-2 pl-8 pr-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading applicants…
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <p className="text-sm font-medium">Couldn&apos;t load applicants</p>
            <p className="text-sm text-muted-foreground">{error.message}</p>
          </div>
        ) : applicants.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <UserSearch className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">
              {hasActiveFilters ? "No applicants match your filters" : "No applicants yet"}
            </p>
            <p className="text-sm text-muted-foreground">
              {hasActiveFilters
                ? "Try adjusting your search or date range."
                : "Applicants you add will show up here."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Application No.</th>
                  <th className="px-4 py-3 font-medium">Applicant Name</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Date Applied</th>
                  <th className="px-4 py-3 font-medium">Last Updated</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applicants.map((applicant) => {
                  const v = applicant.values
                  const matchingProfile = profiles.find((p) => String(p.id) === String(v.ProfileId))
                  const fullName = matchingProfile
                    ? `${matchingProfile.values.FirstName} ${matchingProfile.values.LastName}`
                    : "No linked profile"

                  return (
                    <tr
                      key={applicant.id}
                      className="border-b last:border-0 hover:bg-muted/30"
                    >
                      <td className="px-4 py-3 font-medium">
                        {v.ApplicationNumber}
                      </td>
                      <td className="px-4 py-3">
                        {fullName}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium " +
                            getStatusStyle(v.Status)
                          }
                        >
                          {v.Status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(v.CreatedAt)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(v.UpdatedAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => router.push(`/hrm/profiles/${v.ProfileId}?status=${encodeURIComponent(v.Status)}&applicantId=${v.Id}`)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-secondary/50 px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-all hover:bg-secondary focus-visible:outline-none"
                        >
                          <Eye className="h-3.5 w-3.5 opacity-70" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!isLoading && !error && applicants.length > 0 && (
        <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages} · {totalRecords} applicant
            {totalRecords === 1 ? "" : "s"}
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
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-md border px-3 py-1.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50 hover:bg-muted/50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
