"use client"

import * as React from "react"
import { Paperclip } from "lucide-react"

import { TableTemplate } from "@/components/custom/table-template"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { useApiQuery, useAuthorizedHeaders } from "@/lib/api"
import type { PortfolioRecordSectionId } from "../constants/portfolio-sections"
import { getPortfolioRecordSection } from "../constants/portfolio-sections"
import { formatPortfolioDate } from "../utils/format-portfolio-date"
import { PortfolioSection } from "./portfolio-section"

const PAGE_SIZE = 100

export { formatPortfolioDate as formatDate }

export function AttachmentCell({
  href,
  mode = "link",
}: {
  href?: string | null
  mode?: "link" | "modal"
}) {
  if (!href) {
    return (
      <>
        <Button
          variant="ghost"
          size="sm"
          disabled
          className="text-muted-foreground opacity-100 print:hidden"
        >
          <Paperclip aria-hidden="true" className="h-3.5 w-3.5" />
          Files
        </Button>
        <span className="hidden text-xs text-muted-foreground print:inline">No file</span>
      </>
    )
  }

  if (mode === "link") {
    return (
      <>
        <Button variant="outline" size="sm" asChild className="print:hidden">
          <a href={href} target="_blank" rel="noopener noreferrer">
            <Paperclip aria-hidden="true" className="h-3.5 w-3.5" />
            Files
          </a>
        </Button>
        <span className="hidden text-xs print:inline">Attachment available</span>
      </>
    )
  }

  return (
    <>
      <span className="print:hidden">
        <AttachmentModal href={href} />
      </span>
      <span className="hidden text-xs print:inline">Attachment available</span>
    </>
  )
}

function AttachmentModal({ href }: { href: string }) {
  const { headers } = useAuthorizedHeaders()
  const [blobUrl, setBlobUrl] = React.useState<string | null>(null)
  const [isPdf, setIsPdf] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const load = React.useCallback(async () => {
    setError(null)
    try {
      const response = await fetch(href, { headers: await headers() })
      if (!response.ok) {
        throw new Error(`Failed to load attachment (${response.status})`)
      }

      const blob = await response.blob()
      setIsPdf(blob.type.includes("pdf"))
      setBlobUrl(URL.createObjectURL(blob))
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load attachment",
      )
    }
  }, [headers, href])

  return (
    <Dialog
      onOpenChange={(open) => {
        if (open) {
          void load()
          return
        }

        if (blobUrl) URL.revokeObjectURL(blobUrl)
        setBlobUrl(null)
        setError(null)
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Paperclip aria-hidden="true" className="h-3.5 w-3.5" />
          Files
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Attachment</DialogTitle>
        </DialogHeader>
        {error ? (
          <div className="flex h-[45vh] items-center justify-center text-sm text-destructive">
            {error}
          </div>
        ) : !blobUrl ? (
          <Skeleton className="h-[45vh] w-full" />
        ) : isPdf ? (
          <iframe
            src={blobUrl}
            title="Attachment preview"
            className="h-[45vh] w-full rounded-md border"
          />
        ) : (
          <div className="flex h-[45vh] items-center justify-center">
            {/* Blob URLs cannot be optimized by next/image. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={blobUrl}
              alt="Attachment preview"
              className="h-full w-auto rounded-md border object-contain"
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export type PortfolioTableColumn<TRow> = {
  header: string
  render: (
    row: TRow,
    profileId: number | string,
    refresh: () => void,
  ) => React.ReactNode
}

type PagedRows<TRow> = {
  data?: TRow[] | null
  totalPages?: number | string | null
  totalRecords?: number | string | null
}

export function PortfolioTable<TRow extends { id: number | string }>({
  sectionId,
  profileId,
  endpoint,
  loadingLabel,
  columns,
  renderAddButton,
  readOnly = false,
}: {
  sectionId: PortfolioRecordSectionId
  profileId: number | string
  endpoint: string
  loadingLabel: string
  columns: PortfolioTableColumn<TRow>[]
  renderAddButton?: (args: {
    profileId: number | string
    onCreated: () => void
  }) => React.ReactNode
  readOnly?: boolean
}) {
  const [page, setPage] = React.useState(1)
  const section = getPortfolioRecordSection(sectionId)
  const { data, loading, error, refresh } = useApiQuery<PagedRows<TRow>>(
    endpoint,
    {
      Page: page,
      PageSize: PAGE_SIZE,
    },
  )
  const rows = data?.data ?? []
  const totalPages = Number(data?.totalPages ?? 1)
  const totalRecords = Number(data?.totalRecords ?? rows.length)
  const visibleColumns = readOnly
    ? columns.filter((column) => column.header !== "Actions")
    : columns
  const isEmpty = !loading && !error && rows.length === 0
  const action =
    !readOnly && renderAddButton
      ? renderAddButton({ profileId, onCreated: refresh })
      : undefined

  return (
    <PortfolioSection
      id={section.id}
      title={section.label}
      description={section.description}
      recordCount={loading || error ? undefined : totalRecords}
      action={action}
      isEmpty={isEmpty}
      emptyMessage={section.emptyMessage}
    >
      <TableTemplate
        label={`${loadingLabel} table`}
        variant="plain"
        loading={loading}
        loadingLabel={`Loading ${loadingLabel}`}
        loadingSkeleton={{ columns: visibleColumns.length, rows: 5 }}
        error={error}
        onRetry={refresh}
        pagination={
          !loading && !error && rows.length > 0 && totalPages > 1
            ? {
                page,
                pageSize: PAGE_SIZE,
                totalPages,
                totalRecords,
                itemLabel: totalRecords === 1 ? "record" : "records",
                onPageChange: setPage,
              }
            : undefined
        }
        contentClassName="print:overflow-visible"
      >
        <table className="w-full text-sm print:text-xs">
          <thead>
            <tr className="border-b bg-muted/30 text-left text-xs uppercase tracking-wide text-muted-foreground print:bg-transparent">
              {visibleColumns.map((column) => (
                <th
                  key={column.header}
                  className={
                    column.header === "Actions"
                      ? "px-4 py-3 font-medium print:hidden"
                      : "px-4 py-3 font-medium"
                  }
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-b last:border-0 hover:bg-muted/30 print:break-inside-avoid"
              >
                {visibleColumns.map((column) => (
                  <td
                    key={column.header}
                    className={
                      column.header === "Actions"
                        ? "px-4 py-3 print:hidden"
                        : "px-4 py-3 print:whitespace-normal"
                    }
                  >
                    {column.render(row, profileId, refresh)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </TableTemplate>
    </PortfolioSection>
  )
}
