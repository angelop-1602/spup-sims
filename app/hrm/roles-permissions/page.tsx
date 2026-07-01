"use client"

import * as React from "react"
import { useApiQuery, useApiMutation, type components } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { Loader2, Plus, Trash2 } from "lucide-react"

type User = components["schemas"]["UserResponse"]
type PagedUsers = components["schemas"]["PagedResponseOfUserResponse"]
type Role = components["schemas"]["RoleResponse"]
type PagedRoles = components["schemas"]["PagedResponseOfRoleResponse"]
type Permission = components["schemas"]["PermissionResponse"]
type PagedPermissions = components["schemas"]["PagedResponseOfPermissionResponse"]
type UserRoles = components["schemas"]["UserRolesResponse"]
type RolePermissions = components["schemas"]["RolePermissionsResponse"]
type CreateRoleRequest = components["schemas"]["CreateRoleRequest"]
type CreatePermissionRequest = components["schemas"]["CreatePermissionRequest"]

const getUserLabel = (user: User) => `${user.username} (${user.email})`
const getRoleLabel = (role: Role) => role.name
const getPermissionLabel = (permission: Permission) =>
  `${permission.module}.${permission.action}`
const getPermissionCode = (permission: Permission) =>
  `${permission.module}.${permission.action}`

export default function RolesPage() {
  const [section, setSection] = React.useState<"userRoles" | "rolePermissions">(
    "userRoles",
  )
  const [selectedUserId, setSelectedUserId] = React.useState<string>("")
  const [selectedRoleId, setSelectedRoleId] = React.useState<string>("")
  const [assignedRoles, setAssignedRoles] = React.useState<Role[]>([])
  const [assignedPermissions, setAssignedPermissions] = React.useState<Permission[]>([])
  const [selectedAssignRoleId, setSelectedAssignRoleId] = React.useState<string>("")
  const [selectedAssignPermissionId, setSelectedAssignPermissionId] = React.useState<string>("")
  const [newRoleName, setNewRoleName] = React.useState("")
  const [newRoleDescription, setNewRoleDescription] = React.useState("")
  const [newRoleIsActive, setNewRoleIsActive] = React.useState(true)
  const [newPermissionName, setNewPermissionName] = React.useState("")
  const [newPermissionDescription, setNewPermissionDescription] = React.useState("")
  const [newPermissionModule, setNewPermissionModule] = React.useState("")
  const [newPermissionAction, setNewPermissionAction] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)

  // Stabilized so the query's `onError` dep doesn't change every render
  // (a new inline callback each render would otherwise re-fetch in a loop).
  const handleError = React.useCallback(
    (err: Error) => setError(err.message),
    [],
  )

  const { data: usersPaged, refresh: refreshUsers } = useApiQuery<PagedUsers>(
    "/api/identity/users",
    { Page: 1, PageSize: 100, SortBy: "id" },
    { onError: handleError },
  )

  const { data: rolesPaged, refresh: refreshRoles } = useApiQuery<PagedRoles>(
    "/api/identity/roles",
    { Page: 1, PageSize: 100, SortBy: "id" },
    { onError: handleError },
  )

  const { data: permissionsPaged, refresh: refreshPermissions } =
    useApiQuery<PagedPermissions>(
      "/api/identity/permissions",
      { Page: 1, PageSize: 100, SortBy: "id" },
      { onError: handleError },
    )

  const users = usersPaged?.data ?? []
  const roles = rolesPaged?.data ?? []
  const permissions = permissionsPaged?.data ?? []

  const { data: userRoles, refresh: refreshUserRoles } = useApiQuery<UserRoles>(
    selectedUserId ? `/api/identity/users/${selectedUserId}/roles` : undefined,
    undefined,
    {
      enabled: Boolean(selectedUserId),
      onError: handleError,
    },
  )

  const { data: rolePermissions, refresh: refreshRolePermissions } =
    useApiQuery<RolePermissions>(
      selectedRoleId ? `/api/identity/roles/${selectedRoleId}/permissions` : undefined,
      undefined,
      {
        enabled: Boolean(selectedRoleId),
        onError: handleError,
      },
    )

  React.useEffect(() => {
    setAssignedRoles(userRoles?.roles ?? [])
  }, [userRoles])

  React.useEffect(() => {
    setAssignedPermissions(rolePermissions?.permissions ?? [])
  }, [rolePermissions])

  React.useEffect(() => {
    if (!selectedUserId) setAssignedRoles([])
  }, [selectedUserId])

  React.useEffect(() => {
    if (!selectedRoleId) setAssignedPermissions([])
  }, [selectedRoleId])

  const { mutate: command, loading: saving } = useApiMutation()

  const run = async (fn: () => Promise<boolean>, message: string) => {
    setError(null)
    const ok = await fn()
    if (!ok) setError(message)
  }

  const assignRoleToUser = () =>
    run(async () => {
      if (!selectedUserId || !selectedAssignRoleId) {
        setError("Select a user and a role to assign.")
        return false
      }
      const ok = await command({
        path: `/api/identity/users/${selectedUserId}/roles/${selectedAssignRoleId}`,
        method: "POST",
      })
      if (ok) {
        await refreshUserRoles()
        setSelectedAssignRoleId("")
      }
      return ok
    }, "Unable to assign role to user")

  const removeRoleFromUser = (roleId: number | string) =>
    run(async () => {
      if (!selectedUserId) return false
      const ok = await command({
        path: `/api/identity/users/${selectedUserId}/roles/${roleId}`,
        method: "DELETE",
      })
      if (ok) await refreshUserRoles()
      return ok
    }, "Unable to remove role from user")

  const assignPermissionToRole = () =>
    run(async () => {
      if (!selectedRoleId || !selectedAssignPermissionId) {
        setError("Select a role and a permission to assign.")
        return false
      }
      const ok = await command({
        path: `/api/identity/roles/${selectedRoleId}/permissions/${selectedAssignPermissionId}`,
        method: "POST",
      })
      if (ok) {
        await refreshRolePermissions()
        setSelectedAssignPermissionId("")
      }
      return ok
    }, "Unable to assign permission to role")

  const removePermissionFromRole = (permissionId: number | string) =>
    run(async () => {
      if (!selectedRoleId) return false
      const ok = await command({
        path: `/api/identity/roles/${selectedRoleId}/permissions/${permissionId}`,
        method: "DELETE",
      })
      if (ok) await refreshRolePermissions()
      return ok
    }, "Unable to remove permission from role")

  const createRole = () =>
    run(async () => {
      if (!newRoleName.trim()) {
        setError("Role name is required.")
        return false
      }
      const body: CreateRoleRequest = {
        name: newRoleName.trim(),
        description: newRoleDescription.trim() || null,
        isActive: newRoleIsActive,
      }
      const ok = await command({
        path: "/api/identity/roles",
        method: "POST",
        body,
      })
      if (ok) {
        setNewRoleName("")
        setNewRoleDescription("")
        setNewRoleIsActive(true)
        await refreshRoles()
      }
      return ok
    }, "Unable to create role")

  const createPermission = () =>
    run(async () => {
      if (!newPermissionName.trim() || !newPermissionModule.trim() || !newPermissionAction.trim()) {
        setError("Permission name, module, and action are required.")
        return false
      }
      const body: CreatePermissionRequest = {
        name: newPermissionName.trim(),
        description: newPermissionDescription.trim() || null,
        module: newPermissionModule.trim(),
        action: newPermissionAction.trim(),
      }
      const ok = await command({
        path: "/api/identity/permissions",
        method: "POST",
        body,
      })
      if (ok) {
        setNewPermissionName("")
        setNewPermissionDescription("")
        setNewPermissionModule("")
        setNewPermissionAction("")
        await refreshPermissions()
      }
      return ok
    }, "Unable to create permission")

  const listLoading = !usersPaged && !rolesPaged && !permissionsPaged

  const availableRoles = roles.filter(
    (role) => !assignedRoles.some((assigned) => String(assigned.id) === String(role.id)),
  )

  const availablePermissions = permissions.filter(
    (permission) =>
      !assignedPermissions.some(
        (assigned) => String(assigned.id) === String(permission.id),
      ),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal">
            Identity Assignments
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Assign roles to users and permissions to roles using the identity API.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={section === "userRoles" ? "default" : "outline"}
            onClick={() => setSection("userRoles")}
          >
            User Role Assignment
          </Button>
          <Button
            variant={section === "rolePermissions" ? "default" : "outline"}
            onClick={() => setSection("rolePermissions")}
          >
            Role Permission Assignment
          </Button>
        </div>
      </div>

      {error ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {listLoading ? (
        <div className="rounded-lg border p-6 text-center text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading identity data...
          </span>
        </div>
      ) : null}

      {section === "userRoles" ? (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-[1.5fr_1fr]">
            <div className="space-y-3">
              <Label htmlFor="user-select">User</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger id="user-select" className="w-full">
                  <SelectValue placeholder="Choose a user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={String(user.id)} value={String(user.id)}>
                      {getUserLabel(user)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="assign-role-select">Assign Role</Label>
              <div className="flex items-end gap-2">
                <Select
                  value={selectedAssignRoleId}
                  onValueChange={setSelectedAssignRoleId}
                >
                  <SelectTrigger id="assign-role-select" className="w-full">
                    <SelectValue placeholder="Choose a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles.map((role) => (
                      <SelectItem key={String(role.id)} value={String(role.id)}>
                        {getRoleLabel(role)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={assignRoleToUser}
                  disabled={!selectedUserId || !selectedAssignRoleId || saving}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Assign
                </Button>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-muted/5 p-4">
            <div className="grid gap-4 md:grid-cols-[1.5fr_1fr]">
              <div className="space-y-3">
                <Label htmlFor="new-role-name">New Role Name</Label>
                <Input
                  id="new-role-name"
                  value={newRoleName}
                  onChange={(event) => setNewRoleName(event.target.value)}
                  placeholder="Role name"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="new-role-status">Active</Label>
                <Button
                  variant={newRoleIsActive ? "default" : "outline"}
                  onClick={() => setNewRoleIsActive((value) => !value)}
                  className="h-9"
                >
                  {newRoleIsActive ? "Active" : "Inactive"}
                </Button>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-1 mt-4">
              <div className="space-y-3">
                <Label htmlFor="new-role-description">Description</Label>
                <Textarea
                  id="new-role-description"
                  value={newRoleDescription}
                  onChange={(event) => setNewRoleDescription(event.target.value)}
                  placeholder="Optional role description"
                  className="min-h-[120px]"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={createRole} disabled={saving || !newRoleName.trim()}>
                <Plus className="mr-2 h-4 w-4" />
                Create Role
              </Button>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Remove</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedUserId === "" ? (
                  <TableRow>
                    <TableCell colSpan={5} className="p-6 text-center text-sm text-muted-foreground">
                      Select a user to view assigned roles.
                    </TableCell>
                  </TableRow>
                ) : assignedRoles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="p-6 text-center text-sm text-muted-foreground">
                      No roles assigned to this user.
                    </TableCell>
                  </TableRow>
                ) : (
                  assignedRoles.map((role) => (
                    <TableRow key={String(role.id)}>
                      <TableCell>{role.id}</TableCell>
                      <TableCell>{getRoleLabel(role)}</TableCell>
                      <TableCell>{role.description ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant={role.isActive ? "secondary" : "outline"}>
                          {role.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeRoleFromUser(role.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-[1.5fr_1fr]">
            <div className="space-y-3">
              <Label htmlFor="role-select">Role</Label>
              <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                <SelectTrigger id="role-select" className="w-full">
                  <SelectValue placeholder="Choose a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={String(role.id)} value={String(role.id)}>
                      {getRoleLabel(role)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="assign-permission-select">Assign Permission</Label>
              <div className="flex items-end gap-2">
                <Select
                  value={selectedAssignPermissionId}
                  onValueChange={setSelectedAssignPermissionId}
                >
                  <SelectTrigger id="assign-permission-select" className="w-full">
                    <SelectValue placeholder="Choose a permission" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePermissions.map((permission) => (
                      <SelectItem key={String(permission.id)} value={String(permission.id)}>
                        {getPermissionLabel(permission)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={assignPermissionToRole}
                  disabled={!selectedRoleId || !selectedAssignPermissionId || saving}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Assign
                </Button>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-muted/5 p-4">
            <div className="grid gap-4 md:grid-cols-[1.5fr_1fr]">
              <div className="space-y-3">
                <Label htmlFor="new-permission-name">Permission Name</Label>
                <Input
                  id="new-permission-name"
                  value={newPermissionName}
                  onChange={(event) => setNewPermissionName(event.target.value)}
                  placeholder="Permission name"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="new-permission-module">Module</Label>
                <Input
                  id="new-permission-module"
                  value={newPermissionModule}
                  onChange={(event) => setNewPermissionModule(event.target.value)}
                  placeholder="Module"
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-[1.5fr_1fr] mt-4">
              <div className="space-y-3">
                <Label htmlFor="new-permission-action">Action</Label>
                <Input
                  id="new-permission-action"
                  value={newPermissionAction}
                  onChange={(event) => setNewPermissionAction(event.target.value)}
                  placeholder="Action"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="new-permission-description">Description</Label>
                <Textarea
                  id="new-permission-description"
                  value={newPermissionDescription}
                  onChange={(event) => setNewPermissionDescription(event.target.value)}
                  placeholder="Optional permission description"
                  className="min-h-[120px]"
                />
              </div>
            </div>
            <div className="rounded-lg border border-dashed border-border bg-background px-4 py-3">
              <p className="text-sm font-medium">Permission code</p>
              <p className="text-sm text-muted-foreground">
                {newPermissionModule.trim() && newPermissionAction.trim()
                  ? `${newPermissionModule.trim()}.${newPermissionAction.trim()}`
                  : "Module and action will form the permission code."}
              </p>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={createPermission}
                disabled={
                  saving ||
                  !newPermissionName.trim() ||
                  !newPermissionModule.trim() ||
                  !newPermissionAction.trim()
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Permission
              </Button>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead className="text-right">Remove</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedRoleId === "" ? (
                  <TableRow>
                    <TableCell colSpan={6} className="p-6 text-center text-sm text-muted-foreground">
                      Select a role to view assigned permissions.
                    </TableCell>
                  </TableRow>
                ) : assignedPermissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="p-6 text-center text-sm text-muted-foreground">
                      No permissions assigned to this role.
                    </TableCell>
                  </TableRow>
                ) : (
                  assignedPermissions.map((permission) => (
                    <TableRow key={String(permission.id)}>
                      <TableCell>{permission.id}</TableCell>
                      <TableCell>{permission.name}</TableCell>
                      <TableCell>{getPermissionCode(permission)}</TableCell>
                      <TableCell>{permission.module}</TableCell>
                      <TableCell>{permission.action}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removePermissionFromRole(permission.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  )
}
