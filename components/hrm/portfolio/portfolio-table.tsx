"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { Loader2, Paperclip, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useApiQuery, useAuthorizedHeaders } from "@/lib/api"

const PAGE_SIZE = 10

export function formatDate(dateString: string | null | undefined) {
  if (!dateString) return "—"
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function AttachmentCell({
  href,
  mode = "link",
}: {
  href?: string | null
  mode?: "link" | "modal"
}) {
  if (!href) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Paperclip className="h-3.5 w-3.5" />
        Files
      </Button>
    )
  }

  if (mode === "link") {
    return (
      <Button variant="outline" size="sm" asChild>
        <a href={href} target="_blank" rel="noopener noreferrer">
          <Paperclip className="h-3.5 w-3.5" />
          Files
        </a>
      </Button>
    )
  }

  const isPdf = href.toLowerCase().endsWith(".pdf")

  return <AttachmentModal href={href} isPdf={isPdf} />
}

// The attachment endpoint requires a bearer token, which an <iframe>/<img> src
// can't send — fetch it as an authorized blob and render that instead.
function AttachmentModal({ href, isPdf }: { href: string; isPdf: boolean }) {
  const { headers } = useAuthorizedHeaders()
  const [blobUrl, setBlobUrl] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const load = React.useCallback(async () => {
    setError(null)
    try {
      const response = await fetch(href, { headers: await headers() })
      if (!response.ok) throw new Error(`Failed to load attachment (${response.status})`)
      const blob = await response.blob()
      setBlobUrl(URL.createObjectURL(blob))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load attachment")
    }
  }, [href, headers])

  return (
    <Dialog
      onOpenChange={(open) => {
        if (open) load()
        else {
          if (blobUrl) URL.revokeObjectURL(blobUrl)
          setBlobUrl(null)
          setError(null)
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Paperclip className="h-3.5 w-3.5" />
          Files
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Attachment</DialogTitle>
        </DialogHeader>
        {error ? (
          <div className="flex h-[75vh] items-center justify-center text-sm text-destructive">{error}</div>
        ) : !blobUrl ? (
          <div className="flex h-[75vh] items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : isPdf ? (
          <iframe src={blobUrl} className="h-[75vh] w-full rounded-md border" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- blob URL, no next.config remotePatterns to configure
          <img src={blobUrl} alt="Attachment" className="max-h-[75vh] w-full rounded-md border object-contain" />
        )}
      </DialogContent>
    </Dialog>
  )
}

export type PortfolioTableColumn<TRow> = {
  header: string
  render: (row: TRow, profileId: number | string, refresh: () => void) => React.ReactNode
}

type PagedRows<TRow> = {
  data?: TRow[] | null
  totalPages?: number | string | null
  totalRecords?: number | string | null
}

export function PortfolioTable<TRow extends { id: number | string }>({
  profileId,
  headerActionsEl,
  endpoint,
  loadingLabel,
  columns,
  renderAddButton,
}: {
  profileId: number | string
  headerActionsEl: HTMLElement | null
  endpoint: string
  loadingLabel: string
  columns: PortfolioTableColumn<TRow>[]
  renderAddButton?: (args: {
    profileId: number | string
    onCreated: () => void
  }) => React.ReactNode
}) {
  const [page, setPage] = React.useState(1)

  const { data, loading, error, refresh } = useApiQuery<PagedRows<TRow>>(endpoint, {
    Page: page,
    PageSize: PAGE_SIZE,
  })
  const rows = data?.data ?? []
  const totalPages = Number(data?.totalPages ?? 1)
  const totalRecords = Number(data?.totalRecords ?? 0)

  return (
    <div>
      {headerActionsEl &&
        createPortal(
          renderAddButton ? (
            renderAddButton({ profileId, onCreated: refresh })
          ) : (
            <Button size="sm">
              <Plus className="h-3.5 w-3.5" />
              Add
            </Button>
          ),
          headerActionsEl,
        )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 px-4 py-10 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading {loadingLabel}…
        </div>
      ) : error ? (
        <div className="px-4 py-10 text-center text-sm text-destructive">
          {error.message}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  {columns.map((column) => (
                    <th key={column.header} className="px-4 py-3 font-medium">
                      {column.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-4 py-6 text-center text-muted-foreground"
                    >
                      No results.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.id} className="border-b last:border-0 hover:bg-muted/30">
                      {columns.map((column) => (
                        <td key={column.header} className="px-4 py-3">
                          {column.render(row, profileId, refresh)}
                        </td>
                      ))}
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
        </>
      )}
    </div>
  )
}
