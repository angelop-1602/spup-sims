"use client"

import * as React from "react"
import { Loader2, Paperclip } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useApiQuery, type components } from "@/lib/api"

type PagedNationalBoards =
  components["schemas"]["PagedResponseOfNationalBoardResponse"]

const COLUMNS = ["Certification", "License Number", "Rating", "Validity", "Attachments"]
const PAGE_SIZE = 10

function formatDate(dateString: string | null) {
  if (!dateString) return "—"
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function NationalCertificationTable({
  profileId,
}: {
  profileId: number | string
}) {
  const [page, setPage] = React.useState(1)

  const { data, loading, error } = useApiQuery<PagedNationalBoards>(
    `/api/v1/hrms/profiles/${profileId}/national-boards`,
    { Page: page, PageSize: PAGE_SIZE },
  )
  const rows = data?.data ?? []
  const totalPages = Number(data?.totalPages ?? 1)
  const totalRecords = Number(data?.totalRecords ?? 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 px-4 py-10 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading national certifications…
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-4 py-10 text-center text-sm text-destructive">
        {error.message}
      </div>
    )
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30 text-left text-xs uppercase tracking-wide text-muted-foreground">
              {COLUMNS.map((column) => (
                <th key={column} className="px-4 py-3 font-medium">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={COLUMNS.length}
                  className="px-4 py-6 text-center text-muted-foreground"
                >
                  No results.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">{row.certification}</td>
                  <td className="px-4 py-3">{row.licenseNumber}</td>
                  <td className="px-4 py-3">{row.rating ?? "—"}</td>
                  <td className="px-4 py-3">{formatDate(row.validity)}</td>
                  <td className="px-4 py-3">
                    {row.attachment ? (
                      <Button variant="outline" size="sm" asChild>
                        <a href={row.attachment} target="_blank" rel="noopener noreferrer">
                          <Paperclip className="h-3.5 w-3.5" />
                          Files
                        </a>
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" disabled>
                        <Paperclip className="h-3.5 w-3.5" />
                        Files
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {rows.length > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 border-t px-4 py-3 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages} · {totalRecords} record
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
