"use client"

import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ApiError, request } from "@/lib/api/client"

const PAGE_SIZE = 10

interface JobApplicationListItem {
  id: number
  jobPostingId: number
  jobPostingTitle: string
  status: number
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal">My Job Applications</h1>
        <p className="mt-1 text-sm text-muted-foreground">Track the status of the positions you&apos;ve applied for.</p>
      </div>

      <Card className="overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="space-y-3 p-6">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-10 w-full" />
                ))}
              </div>
            ) : error ? (
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <p className="text-sm text-destructive">{error}</p>
                <Button variant="outline" size="sm" onClick={() => setReloadToken((token) => token + 1)}>
                  Retry
                </Button>
              </div>
            ) : totalRecords === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                You haven&apos;t applied to any job postings yet.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Job Posting</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Applied On</TableHead>
                    <TableHead className="pr-6">Cover Letter</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="pl-6 font-medium">{item.jobPostingTitle}</TableCell>
                      <TableCell>
                        <Badge variant="outline">Status {item.status}</Badge>
                      </TableCell>
                      <TableCell>{formatDate(item.createdAt)}</TableCell>
                      <TableCell className="pr-6 text-muted-foreground">
                        {item.coverLetter ? item.coverLetter : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>

          {!isLoading && !error && totalRecords > 0 && (
            <CardFooter className="flex items-center justify-between border-t">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages} · {totalRecords} application{totalRecords === 1 ? "" : "s"}
              </p>
              <Pagination className="mx-0 w-auto">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      aria-disabled={page <= 1}
                      className={page <= 1 ? "pointer-events-none opacity-50" : undefined}
                      onClick={(event) => {
                        event.preventDefault()
                        setPage((current) => Math.max(1, current - 1))
                      }}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      href="#"
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
            </CardFooter>
          )}
      </Card>
    </div>
  )
}
