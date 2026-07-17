"use client"

import * as React from "react"
import { Loader2, CloudDownload, AlertCircle } from "lucide-react"
import { useApiQuery, useAuthorizedHeaders, request, type components } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PermissionGuard } from "@/components/auth/permission-guard"
import { TableTemplate } from "@/components/custom/table-template"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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

type AzureUserDto = components["schemas"]["AzureUserDto"]
type AzureImportResult = components["schemas"]["AzureImportResult"]

type PagedAzureUsers = {
  data?: AzureUserDto[] | null
  totalPages?: number | string | null
  totalRecords?: number | string | null
}

const PAGE_SIZE = 20

export default function AzureEligibleUsersPage() {
  const [search, setSearch] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [page, setPage] = React.useState(1)

  // Row selection for import
  const [selected, setSelected] = React.useState<Set<string>>(new Set())

  // Import dialog state
  const [importConfirmOpen, setImportConfirmOpen] = React.useState(false)
  const [importResult, setImportResult] = React.useState<AzureImportResult | null>(null)
  const [importResultOpen, setImportResultOpen] = React.useState(false)
  const [importError, setImportError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(1)
    }, 250)
    return () => clearTimeout(timeout)
  }, [search])

  const {
    data: paged,
    loading,
    error,
    refresh,
  } = useApiQuery<PagedAzureUsers>("/api/v1/hrms/azure/eligible-users", {
    Page: page,
    PageSize: PAGE_SIZE,
    Search: debouncedSearch || undefined,
  })

  const [importing, setImporting] = React.useState(false)
  const { headers } = useAuthorizedHeaders()

  const users = paged?.data ?? []
  const totalPages = Number(paged?.totalPages ?? 1)
  const totalRecords = Number(paged?.totalRecords ?? 0)
  const allOnPageSelected = users.length > 0 && users.every((u) => selected.has(u.azureObjectId))

  function toggleAll() {
    if (allOnPageSelected) {
      setSelected((prev) => {
        const next = new Set(prev)
        users.forEach((u) => next.delete(u.azureObjectId))
        return next
      })
    } else {
      setSelected((prev) => {
        const next = new Set(prev)
        users.forEach((u) => next.add(u.azureObjectId))
        return next
      })
    }
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function handleImport() {
    setImportError(null)
    setImporting(true)
    const body = selected.size > 0
      ? { azureObjectIds: Array.from(selected) }
      : { azureObjectIds: null }

    try {
      const result = await request<AzureImportResult>(
        "/api/v1/hrms/azure/eligible-users/import",
        headers,
        { method: "POST", body },
      )
      setImportConfirmOpen(false)
      setImportResult(result ?? null)
      setImportResultOpen(true)
      setSelected(new Set())
      await refresh()
    } catch {
      setImportConfirmOpen(false)
      setImportError("Import failed. Please try again.")
    } finally {
      setImporting(false)
    }
  }

  return (
    <PermissionGuard requiredPermission="hrms.azure.users.view">

        {/* Table */}
        <TableTemplate
          label="Azure eligible users table"
          search={{
            value: search,
            onChange: setSearch,
            onClear: () => {
              setSearch("")
              setPage(1)
            },
            placeholder: "Search by name or email",
            label: "Search eligible users",
          }}
          leadingActions={
            selected.size > 0 ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSelected(new Set())}
              >
                Clear selection ({selected.size})
              </Button>
            ) : undefined
          }
          actions={
            <Button
              onClick={() => {
                setImportError(null)
                setImportConfirmOpen(true)
              }}
              disabled={importing}
            >
              <CloudDownload className="mr-2 h-4 w-4" />
              {selected.size > 0
                ? `Import ${selected.size} selected`
                : "Import all"}
            </Button>
          }
          loading={loading}
          loadingLabel="Fetching eligible users from Microsoft Entra ID"
          loadingSkeleton={{ columns: 5, rows: 8 }}
          error={error}
          onRetry={refresh}
          empty={users.length === 0}
          emptyState={
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <CloudDownload className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium">
                {debouncedSearch
                  ? "No users match your search"
                  : "No eligible users found"}
              </p>
              <p className="text-sm text-muted-foreground">
                {debouncedSearch
                  ? "Try a different name or email."
                  : "All eligible faculty accounts may already be imported."}
              </p>
            </div>
          }
          pagination={
            !loading && !error && users.length > 0
              ? {
                  page,
                  pageSize: PAGE_SIZE,
                  totalPages,
                  totalRecords,
                  itemLabel:
                    totalRecords === 1
                      ? "eligible user"
                      : "eligible users",
                  onPageChange: setPage,
                }
              : undefined
          }
        >
          <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={allOnPageSelected}
                        onChange={toggleAll}
                        aria-label="Select all on this page"
                        className="h-4 w-4 rounded border-input"
                      />
                    </th>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Department</th>
                    <th className="px-4 py-3 font-medium">Job Title</th>
                    <th className="px-4 py-3 font-medium">Licenses</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.azureObjectId}
                      className="border-b last:border-0 hover:bg-muted/30"
                      onClick={() => toggleOne(user.azureObjectId)}
                    >
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selected.has(user.azureObjectId)}
                          onChange={() => toggleOne(user.azureObjectId)}
                          aria-label={`Select ${user.displayName}`}
                          className="h-4 w-4 rounded border-input"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{user.displayName}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{user.department ?? "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{user.jobTitle ?? "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {user.licenses.map((lic) => (
                            <Badge key={lic} variant="outline" className="text-xs font-mono">
                              {lic}
                            </Badge>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
          </div>
        </TableTemplate>

        {/* Import confirm dialog */}
        <AlertDialog open={importConfirmOpen} onOpenChange={setImportConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm import</AlertDialogTitle>
              <AlertDialogDescription>
                {selected.size > 0
                  ? `This will import ${selected.size} selected user${selected.size === 1 ? "" : "s"} into HRMS as Employee records.`
                  : "This will import all currently eligible Azure users into HRMS as Employee records."}
                {" "}Users who are already onboarded will be skipped.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleImport} disabled={importing}>
                {importing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing…
                  </>
                ) : "Import"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Import result dialog */}
        <Dialog open={importResultOpen} onOpenChange={setImportResultOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Import complete</DialogTitle>
              <DialogDescription>
                {importResult?.successCount ?? 0} imported, {importResult?.skippedCount ?? 0} skipped.
              </DialogDescription>
            </DialogHeader>

            {(importResult?.imported?.length ?? 0) > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Imported</p>
                <ul className="max-h-48 space-y-1 overflow-y-auto rounded-md border p-3">
                  {importResult!.imported.map((u) => (
                    <li key={u.azureObjectId} className="text-sm">
                      <span className="font-medium">{u.displayName}</span>
                      <span className="ml-2 text-muted-foreground">{u.email}</span>
                      <span className="ml-2 font-mono text-xs text-muted-foreground">#{u.employeeNumber}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(importResult?.skipped?.length ?? 0) > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Skipped</p>
                <ul className="max-h-36 space-y-1 overflow-y-auto rounded-md border p-3">
                  {importResult!.skipped.map((u) => (
                    <li key={u.azureObjectId} className="text-sm">
                      <span className="font-medium">{u.displayName}</span>
                      <span className="ml-2 text-muted-foreground">{u.email}</span>
                      <span className="ml-2 text-xs text-amber-600">{u.reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <DialogFooter>
              <Button onClick={() => setImportResultOpen(false)}>Done</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </PermissionGuard>
  )
}
