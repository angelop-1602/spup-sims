"use client"

import * as React from "react"
import { Search, Undo2 } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Skeleton } from "@/components/ui/skeleton"
import { ApiError, request } from "@/lib/api/client"
import Link from "next/link"

const PAGE_SIZE = 10

const STATUS_LABELS: Record<number, string> = {
  0: "Draft",
  1: "Pending",
  2: "Submitted",
  3: "Interview",
  4: "Hired",
  5: "Rejected",
}

function resolveStatusLabel(status: number | string): string {
  if (typeof status === "string") return status
  return STATUS_LABELS[status] ?? `Status ${status}`
}

// ponytail: same hues STATUS_STYLES used to use, as solid fills for the corner ribbon (needs to read against its own background, not the card's)
const RIBBON_STYLES: Record<string, string> = {
  Draft: "bg-orange-500 text-white",
  Pending: "bg-yellow-400 text-yellow-950",
  Submitted: "bg-purple-500 text-white",
  Interview: "bg-blue-500 text-white",
  Hired: "bg-green-500 text-white",
  Rejected: "bg-red-500 text-white",
}

function resolveRibbonStyle(label: string): string {
  return RIBBON_STYLES[label] ?? "bg-muted-foreground text-white"
}

interface JobApplicationListItem {
  id: number
  jobPostingId: number
  jobPostingTitle: string
  status: number | string
  coverLetter: string | null
  createdAt: string
  updatedAt: string | null
}

interface JobApplicationsPage {
  data: JobApplicationListItem[]
  page: number
  pageSize: number
  totalRecords: number
  totalPages: number
}

interface JobApplicationDetail {
  id: number
  jobPostingId: number
  jobPostingTitle: string
  employeeApplicantId: number
  applicantName: string
  applicantEmail: string
  status: number | string
  coverLetter: string | null
  internalRemarks: string | null
  employeeId: number | null
  createdAt: string
  updatedAt: string | null
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export default function ApplicantJobApplications() {
  const [page, setPage] = React.useState(1)
  const [items, setItems] = React.useState<JobApplicationListItem[]>([])
  const [totalPages, setTotalPages] = React.useState(0)
  const [totalRecords, setTotalRecords] = React.useState(0)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [reloadToken, setReloadToken] = React.useState(0)
  const [searchTerm, setSearchTerm] = React.useState("")

  const [selectedId, setSelectedId] = React.useState<number | null>(null)
  const [detail, setDetail] = React.useState<JobApplicationDetail | null>(null)
  const [detailLoading, setDetailLoading] = React.useState(false)
  const [detailError, setDetailError] = React.useState<string | null>(null)
  const [detailReloadToken, setDetailReloadToken] = React.useState(0)

  const [withdrawConfirmOpen, setWithdrawConfirmOpen] = React.useState(false)
  const [isWithdrawing, setIsWithdrawing] = React.useState(false)
  const [withdrawError, setWithdrawError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const result = await request<JobApplicationsPage>("/api/v1/applicant/job-applications", {
          params: { Page: page, PageSize: PAGE_SIZE, Descending: true },
        })
        if (cancelled) return
        setItems(result.data)
        setTotalPages(result.totalPages)
        setTotalRecords(result.totalRecords)
        setSelectedId((current) =>
          result.data.some((item) => item.id === current) ? current : (result.data[0]?.id ?? null)
        )
      } catch (err) {
        if (cancelled) return
        setError(err instanceof ApiError ? err.message : "An unexpected network error occurred.")
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [page, reloadToken])

  React.useEffect(() => {
    if (selectedId === null) {
      setDetail(null)
      return
    }
    let cancelled = false

    async function loadDetail() {
      setDetailLoading(true)
      setDetailError(null)
      try {
        const result = await request<JobApplicationDetail>(`/api/v1/applicant/job-applications/${selectedId}`)
        if (cancelled) return
        setDetail(result)
      } catch (err) {
        if (cancelled) return
        setDetailError(err instanceof ApiError ? err.message : "An unexpected network error occurred.")
      } finally {
        if (!cancelled) setDetailLoading(false)
      }
    }

    void loadDetail()
    return () => {
      cancelled = true
    }
  }, [selectedId, detailReloadToken])

  async function handleWithdraw() {
    if (!detail) return
    setIsWithdrawing(true)
    setWithdrawError(null)
    try {
      await request(`/api/v1/applicant/job-applications/${detail.id}/withdraw`, { method: "POST" })
      setWithdrawConfirmOpen(false)
      setReloadToken((token) => token + 1)
      setDetailReloadToken((token) => token + 1)
    } catch (err) {
      setWithdrawError(err instanceof ApiError ? err.message : "An unexpected network error occurred.")
    } finally {
      setIsWithdrawing(false)
    }
  }

  const filteredItems = React.useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return items
    return items.filter((item) => item.jobPostingTitle.toLowerCase().includes(query))
  }, [items, searchTerm])

  const detailLabel = detail ? resolveStatusLabel(detail.status) : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal">My Job Applications</h1>
        <p className="mt-1 text-sm text-muted-foreground">Track the status of the positions you&apos;ve applied for.</p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-[336px_1fr]">
          <Card className="p-4">
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-14 w-full" />
              ))}
            </div>
          </Card>
          <Card className="p-6">
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-5 w-full" />
              ))}
            </div>
          </Card>
        </div>
      ) : error ? (
        <Card className="flex flex-col items-center gap-3 py-12 text-center">
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" size="sm" onClick={() => setReloadToken((token) => token + 1)}>
            Retry
          </Button>
        </Card>
      ) : totalRecords === 0 ? (
        <Card className="py-12 text-center text-sm text-muted-foreground">
          You haven&apos;t applied to any job postings yet.
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-[336px_1fr] md:items-start">
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search this page's applications"
                className="pl-8"
              />
            </div>

            {filteredItems.length === 0 ? (
              <Card className="py-8 text-center text-sm text-muted-foreground">
                No applications match &quot;{searchTerm}&quot;.
              </Card>
            ) : (
              <div className="flex max-h-128 flex-col gap-2 overflow-y-auto p-0.5">
                {filteredItems.map((item) => {
                  const label = resolveStatusLabel(item.status)
                  const isSelected = item.id === selectedId
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedId(item.id)}
                      aria-current={isSelected}
                      className={`relative flex flex-col gap-1.5 overflow-hidden rounded-xl bg-card px-4 py-3 text-left shadow-xs ring-1 transition-colors hover:bg-muted/40 ${
                        isSelected ? "bg-yellow-50/50 ring-1 ring-yellow-500" : "ring-foreground/10"
                      }`}
                    >
                      <span
                        className={`absolute top-0 right-0 rounded-tl-none rounded-tr-xl rounded-bl-xl rounded-br-none px-3 py-1 text-[10px] font-semibold tracking-wide uppercase ${resolveRibbonStyle(label)}`}
                      >
                        {label}
                      </span>
                      <span className="max-w-[70%] truncate font-medium">{item.jobPostingTitle}</span>
                      <span className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</span>
                    </button>
                  )
                })}
              </div>
            )}

            <div className="flex items-center justify-between border-t border-border pt-3">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <Pagination className="mx-0 w-auto items-center">
                <PaginationContent className="gap-0.5">
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      text=""
                      size="icon-sm"
                      aria-disabled={page <= 1}
                      className={page <= 1 ? "pointer-events-none opacity-50" : undefined}
                      onClick={(event) => {
                        event.preventDefault()
                        setPage((current) => Math.max(1, current - 1))
                      }}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        href="#"
                        size="icon-sm"
                        isActive={pageNumber === page}
                        className={
                          pageNumber === page
                            ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                            : undefined
                        }
                        onClick={(event) => {
                          event.preventDefault()
                          setPage(pageNumber)
                        }}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      text=""
                      size="icon-sm"
                      aria-disabled={page >= totalPages}
                      className={page >= totalPages ? "pointer-events-none opacity-50" : undefined}
                      onClick={(event) => {
                        event.preventDefault()
                        setPage((current) => Math.min(totalPages, current + 1))
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {detailLoading ? (
              <Card className="p-6">
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Skeleton key={index} className="h-5 w-full" />
                  ))}
                </div>
              </Card>
            ) : detailError ? (
              <Card className="p-6">
                <div className="flex flex-col items-center gap-3 py-6 text-center">
                  <p className="text-sm text-destructive">{detailError}</p>
                  <Button variant="outline" size="sm" onClick={() => setDetailReloadToken((token) => token + 1)}>
                    Retry
                  </Button>
                </div>
              </Card>
            ) : detail && detailLabel ? (
              <>
                <Card className="bg-primary p-6 text-primary-foreground">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5">
                      <Link
                        href={`/job-openings/${detail.jobPostingId}`}
                        className="text-lg font-semibold hover:underline"
                      >
                        {detail.jobPostingTitle}
                      </Link>
                      <p className="text-sm text-primary-foreground/80">
                        Application Status: <span className="font-medium text-primary-foreground">{detailLabel}</span>
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-foreground"
                      disabled={detailLabel === "Withdrawn"}
                      onClick={() => setWithdrawConfirmOpen(true)}
                    >
                      <Undo2 />
                      Withdraw
                    </Button>
                  </div>
                </Card>

                <Card className="gap-0 py-0">
                  <div className="flex items-center border-b border-border bg-muted/75 px-4 py-2">
                    <h2 className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                      Personal Details
                    </h2>
                  </div>
                  <div className="divide-y divide-border text-sm">
                    <div className="grid grid-cols-3 items-center px-4 py-3">
                      <span className="text-muted-foreground">Applicant</span>
                      <span className="col-span-2 font-medium">{detail.applicantName}</span>
                    </div>
                    <div className="grid grid-cols-3 items-center px-4 py-3">
                      <span className="text-muted-foreground">Email</span>
                      <span className="col-span-2 font-medium break-all">{detail.applicantEmail}</span>
                    </div>
                    <div className="grid grid-cols-3 items-center px-4 py-3">
                      <span className="text-muted-foreground">Applied On</span>
                      <span className="col-span-2 font-medium">{formatDate(detail.createdAt)}</span>
                    </div>
                  </div>
                </Card>

                <Card className="gap-0 py-0">
                  <div className="flex items-center border-b border-border bg-muted/75 px-4 py-2">
                    <h2 className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                      Cover Letter
                    </h2>
                  </div>
                  <div className="px-4 py-3 text-sm">{detail.coverLetter ? detail.coverLetter : "—"}</div>
                </Card>

                <Card className="gap-0 py-0">
                  <div className="flex items-center border-b border-border bg-muted/75 px-4 py-2">
                    <h2 className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                      Internal Remarks
                    </h2>
                  </div>
                  <div className="px-4 py-3 text-sm">{detail.internalRemarks ? detail.internalRemarks : "—"}</div>
                </Card>
              </>
            ) : (
              <Card className="p-6">
                <p className="py-12 text-center text-sm text-muted-foreground">
                  Select an application to see its details.
                </p>
              </Card>
            )}
          </div>
        </div>
      )}

      <AlertDialog open={withdrawConfirmOpen} onOpenChange={(open) => !open && setWithdrawConfirmOpen(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Withdraw Application</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to withdraw your application for &quot;{detail?.jobPostingTitle}&quot;? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {withdrawError && <p className="text-sm text-destructive">{withdrawError}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isWithdrawing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isWithdrawing}
              onClick={(event) => {
                event.preventDefault()
                void handleWithdraw()
              }}
            >
              {isWithdrawing ? "Withdrawing..." : "Withdraw"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
