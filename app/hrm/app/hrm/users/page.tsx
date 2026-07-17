"use client"

import * as React from "react"
import { Loader2, Search, Trash2, UserRoundCog } from "lucide-react"

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
import { Badge } from "@/components/ui/badge"
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
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useApiQuery, useApiMutation, type components } from "@/lib/api"
import { ApiErrorView } from "@/components/ui/error-page"

type UserResponse = components["schemas"]["UserResponse"]
type PagedUsers = components["schemas"]["PagedResponseOfUserResponse"]
type UserRolesResponse = components["schemas"]["UserRolesResponse"]
type PagedRoles = components["schemas"]["PagedResponseOfRoleResponse"]

const PAGE_SIZE = 10

export default function UsersPage() {
  const { hasPermission } = useHrmAuth()
  const canUpdate = hasPermission("identity.users.update")
  const canDelete = hasPermission("identity.users.delete")

  const [page, setPage] = React.useState(1)
  const [searchInput, setSearchInput] = React.useState("")
  const [search, setSearch] = React.useState("")

  // Debounce search so we don't refetch on every keystroke.
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchInput])

  const {
    data: paged,
    loading,
    error,
    refresh,
  } = useApiQuery<PagedUsers>("/api/v1/identity/users", {
    Page: page,
    PageSize: PAGE_SIZE,
    Search: search || undefined,
  })

  const users = paged?.data ?? []
  const totalPages = Number(paged?.totalPages ?? 1)
  const totalRecords = Number(paged?.totalRecords ?? users.length)

  const { data: rolesData } = useApiQuery<PagedRoles>(
    "/api/v1/identity/roles",
    { Page: 1, PageSize: 100 },
  )
  const allRoles = (rolesData?.data ?? []).filter(
    (role) => role.isActive !== false,
  )

  // ----- Manage roles dialog -----
  const [rolesTarget, setRolesTarget] = React.useState<UserResponse | null>(null)
  const [rolesError, setRolesError] = React.useState<string | null>(null)

  const {
    data: userRoles,
    loading: loadingUserRoles,
    refresh: refreshUserRoles,
  } = useApiQuery<UserRolesResponse>(
    rolesTarget ? `/api/v1/identity/users/${rolesTarget.id}/roles` : null,
  )

  const assignedRoleIds = new Set(
    (userRoles?.roles ?? []).map((role) => String(role.id)),
  )

  const { mutate: mutateRole, loading: mutatingRole } = useApiMutation()

  const toggleRole = async (roleId: number | string, assigned: boolean) => {
    if (!rolesTarget) return
    setRolesError(null)

    const ok = await mutateRole({
      path: `/api/v1/identity/users/${rolesTarget.id}/roles/${roleId}`,
      method: assigned ? "DELETE" : "POST",
    })

    if (!ok) {
      setRolesError(
        assigned ? "Unable to remove the role." : "Unable to assign the role.",
      )
      return
    }

    refreshUserRoles()
    refresh()
  }

  // ----- Delete -----
  const { mutate: deleteUser, loading: deleting } = useApiMutation()
  const [deletingId, setDeletingId] = React.useState<number | string | null>(null)
  const [pageError, setPageError] = React.useState<string | null>(null)

  const handleDelete = async (user: UserResponse) => {
    setDeletingId(user.id)
    setPageError(null)
    const ok = await deleteUser({
      path: `/api/v1/identity/users/${user.id}`,
      method: "DELETE",
    })
    setDeletingId(null)
    if (!ok) {
      setPageError("Unable to delete user.")
      return
    }
    refresh()
  }

  return (
    <PermissionGuard requiredPermission="identity.users.view">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">User Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            View system users and manage their role assignments.
          </p>
        </div>

        {pageError && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {pageError}
          </div>
        )}

        <div className="relative sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search by username or email..."
            className="pl-8"
          />
        </div>

        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Status</TableHead>
                {(canUpdate || canDelete) && (
                  <TableHead className="text-right">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="p-6 text-center">
                    <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading users...
                    </span>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={5} className="p-0">
                    <ApiErrorView error={error} onRetry={refresh} fullScreen />
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="p-6 text-center text-sm text-muted-foreground"
                  >
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={String(user.id)}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.roles.length === 0 ? (
                          <span className="text-sm text-muted-foreground">—</span>
                        ) : (
                          user.roles.map((role) => (
                            <Badge key={String(role.id)} variant="secondary">
                              {role.name}
                            </Badge>
                          ))
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? "default" : "outline"}>
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    {(canUpdate || canDelete) && (
                      <TableCell className="space-x-2 text-right">
                        {canUpdate && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setRolesError(null)
                              setRolesTarget(user)
                            }}
                          >
                            <UserRoundCog className="mr-2 h-4 w-4" />
                            Manage roles
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
                                <AlertDialogTitle>Delete user</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action will permanently remove{" "}
                                  <strong>{user.username}</strong> ({user.email})
                                  and their role assignments.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(user)}
                                  disabled={deletingId === user.id || deleting}
                                >
                                  {deletingId === user.id
                                    ? "Deleting..."
                                    : "Delete"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>
              Page {page} of {totalPages} · {totalRecords} users
            </p>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1 || loading}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
                disabled={page >= totalPages || loading}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Manage roles dialog */}
        <Dialog
          open={Boolean(rolesTarget)}
          onOpenChange={(open) => !open && setRolesTarget(null)}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Manage roles</DialogTitle>
              <DialogDescription>
                Assign or remove roles for{" "}
                <strong>{rolesTarget?.username}</strong> ({rolesTarget?.email}).
                Changes apply immediately.
              </DialogDescription>
            </DialogHeader>

            {loadingUserRoles ? (
              <div className="flex items-center justify-center p-6 text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading roles...
              </div>
            ) : (
              <div className="max-h-80 space-y-1 overflow-y-auto">
                {allRoles.map((role) => {
                  const assigned = assignedRoleIds.has(String(role.id))
                  return (
                    <div
                      key={String(role.id)}
                      className="flex items-center justify-between rounded-md border px-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-medium">{role.name}</p>
                        {role.description ? (
                          <p className="text-xs text-muted-foreground">
                            {role.description}
                          </p>
                        ) : null}
                      </div>
                      <Switch
                        checked={assigned}
                        disabled={mutatingRole}
                        onCheckedChange={() => toggleRole(role.id, assigned)}
                        aria-label={`Toggle ${role.name}`}
                      />
                    </div>
                  )
                })}
                {allRoles.length === 0 && (
                  <p className="p-4 text-center text-sm text-muted-foreground">
                    No roles available.
                  </p>
                )}
              </div>
            )}

            {rolesError ? (
              <p className="text-sm text-destructive">{rolesError}</p>
            ) : null}

            <DialogFooter>
              <Button variant="outline" onClick={() => setRolesTarget(null)}>
                Done
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PermissionGuard>
  )
}
