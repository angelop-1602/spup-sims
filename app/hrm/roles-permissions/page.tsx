"use client"

import * as React from "react"
import { useMsal } from "@azure/msal-react"
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Plus, Trash2 } from "lucide-react"

type ApiResponse<T> = {
  success: boolean
  message: string
  data: T | null
  traceId?: string
  responseTimestamp?: string
  timestamp?: string
  errors?: string[]
}

type PagedResponse<T> = {
  pageNumber?: number | string
  pageSize?: number | string
  totalPages?: number | string
  totalCount?: number | string
  data: T[]
}

type UserResponse = {
  id: number | string
  username: string
  email: string
  roles: RoleResponse[]
  profileId: number | string
  profile: string
  isActive: boolean
}

type RoleResponse = {
  id: number | string
  name: string
  description: null | string
  isActive: boolean
}

type PermissionResponse = {
  id: number | string
  name: string
  description: null | string
  module: string
  action: string
}

type UserRolesResponse = {
  userId: number | string
  username: string
  email: string
  roles: RoleResponse[]
}

type RolePermissionsResponse = {
  roleId: number | string
  role: RoleResponse
  permissions: PermissionResponse[]
}

const API_SCOPES =
  process.env.NEXT_PUBLIC_API_SCOPES?.split(/[\s,]+/).filter(Boolean) ?? [
    "User.Read",
  ]

const getUserLabel = (user: UserResponse) => `${user.username} (${user.email})`
const getRoleLabel = (role: RoleResponse) => role.name
const getPermissionLabel = (permission: PermissionResponse) =>
  `${permission.module}.${permission.action}`
const getPermissionCode = (permission: PermissionResponse) =>
  `${permission.module}.${permission.action}`

const parsePaged = <T,>(payload: unknown): T[] => {
  const page = (payload as any)?.data ?? payload
  if (!page || typeof page !== "object") {
    return []
  }

  const data = (page as any).data
  if (!Array.isArray(data)) {
    return []
  }

  return data as T[]
}

export default function RolesPage() {
  const { accounts, instance } = useMsal()
  const account = accounts[0]

  const [section, setSection] = React.useState<"userRoles" | "rolePermissions">(
    "userRoles"
  )
  const [users, setUsers] = React.useState<UserResponse[]>([])
  const [roles, setRoles] = React.useState<RoleResponse[]>([])
  const [permissions, setPermissions] = React.useState<PermissionResponse[]>([])
  const [selectedUserId, setSelectedUserId] = React.useState<string>("")
  const [selectedRoleId, setSelectedRoleId] = React.useState<string>("")
  const [assignedRoles, setAssignedRoles] = React.useState<RoleResponse[]>([])
  const [assignedPermissions, setAssignedPermissions] = React.useState<PermissionResponse[]>([])
  const [selectedAssignRoleId, setSelectedAssignRoleId] = React.useState<string>("")
  const [selectedAssignPermissionId, setSelectedAssignPermissionId] = React.useState<string>("")
  const [newRoleName, setNewRoleName] = React.useState("")
  const [newRoleDescription, setNewRoleDescription] = React.useState("")
  const [newRoleIsActive, setNewRoleIsActive] = React.useState(true)
  const [newPermissionName, setNewPermissionName] = React.useState("")
  const [newPermissionDescription, setNewPermissionDescription] = React.useState("")
  const [newPermissionModule, setNewPermissionModule] = React.useState("")
  const [newPermissionAction, setNewPermissionAction] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const authHeaders = React.useCallback(async () => {
    if (!account) {
      throw new Error("No authenticated account available")
    }

    const tokenResponse = await instance.acquireTokenSilent({
      scopes: API_SCOPES,
      account,
    })

    return {
      Authorization: `Bearer ${tokenResponse.accessToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    }
  }, [account, instance])

  const fetchJson = React.useCallback(
    async (url: string, init: RequestInit = {}) => {
      const headers = {
        ...(await authHeaders()),
        ...(init.headers as Record<string, string>),
      }

      const response = await fetch(url, {
        ...init,
        headers,
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error(`Request failed (${response.status})`)
      }

      return response.json()
    },
    [authHeaders]
  )

  const loadLists = React.useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const [usersPayload, rolesPayload, permissionsPayload] =
        await Promise.all([
          fetchJson("/api/identity/users?Page=1&PageSize=100&SortBy=id"),
          fetchJson("/api/identity/roles?Page=1&PageSize=100&SortBy=id"),
          fetchJson("/api/identity/permissions?Page=1&PageSize=100&SortBy=id"),
        ])

      setUsers(parsePaged<UserResponse>(usersPayload))
      setRoles(parsePaged<RoleResponse>(rolesPayload))
      setPermissions(parsePaged<PermissionResponse>(permissionsPayload))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load lists")
    } finally {
      setLoading(false)
    }
  }, [fetchJson])

  const loadUserRoles = React.useCallback(
    async (userId: string) => {
      if (!userId) {
        setAssignedRoles([])
        return
      }

      setLoading(true)
      setError(null)

      try {
        const payload = await fetchJson(`/api/identity/users/${userId}/roles`)
        const body = (payload as any)?.data
        setAssignedRoles(Array.isArray(body?.roles) ? body.roles : [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load user roles")
      } finally {
        setLoading(false)
      }
    },
    [fetchJson]
  )

  const loadRolePermissions = React.useCallback(
    async (roleId: string) => {
      if (!roleId) {
        setAssignedPermissions([])
        return
      }

      setLoading(true)
      setError(null)

      try {
        const payload = await fetchJson(`/api/identity/roles/${roleId}/permissions`)
        const body = (payload as any)?.data
        setAssignedPermissions(Array.isArray(body?.permissions) ? body.permissions : [])
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load role permissions"
        )
      } finally {
        setLoading(false)
      }
    },
    [fetchJson]
  )

  React.useEffect(() => {
    if (account) {
      void loadLists()
    }
  }, [account, loadLists])

  React.useEffect(() => {
    if (selectedUserId) {
      void loadUserRoles(selectedUserId)
      setSelectedAssignRoleId("")
    } else {
      setAssignedRoles([])
    }
  }, [selectedUserId, loadUserRoles])

  React.useEffect(() => {
    if (selectedRoleId) {
      void loadRolePermissions(selectedRoleId)
      setSelectedAssignPermissionId("")
    } else {
      setAssignedPermissions([])
    }
  }, [selectedRoleId, loadRolePermissions])

  const assignRoleToUser = async () => {
    if (!selectedUserId || !selectedAssignRoleId) {
      setError("Select a user and a role to assign.")
      return
    }

    setSaving(true)
    setError(null)

    try {
      await fetchJson(
        `/api/identity/users/${selectedUserId}/roles/${selectedAssignRoleId}`,
        { method: "POST" }
      )
      void loadUserRoles(selectedUserId)
      setSelectedAssignRoleId("")
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to assign role to user"
      )
    } finally {
      setSaving(false)
    }
  }

  const removeRoleFromUser = async (roleId: number | string) => {
    if (!selectedUserId) {
      return
    }

    setSaving(true)
    setError(null)

    try {
      await fetchJson(`/api/identity/users/${selectedUserId}/roles/${roleId}`, {
        method: "DELETE",
      })
      void loadUserRoles(selectedUserId)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to remove role from user"
      )
    } finally {
      setSaving(false)
    }
  }

  const assignPermissionToRole = async () => {
    if (!selectedRoleId || !selectedAssignPermissionId) {
      setError("Select a role and a permission to assign.")
      return
    }

    setSaving(true)
    setError(null)

    try {
      await fetchJson(
        `/api/identity/roles/${selectedRoleId}/permissions/${selectedAssignPermissionId}`,
        { method: "POST" }
      )
      void loadRolePermissions(selectedRoleId)
      setSelectedAssignPermissionId("")
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to assign permission to role"
      )
    } finally {
      setSaving(false)
    }
  }

  const removePermissionFromRole = async (permissionId: number | string) => {
    if (!selectedRoleId) {
      return
    }

    setSaving(true)
    setError(null)

    try {
      await fetchJson(
        `/api/identity/roles/${selectedRoleId}/permissions/${permissionId}`,
        { method: "DELETE" }
      )
      void loadRolePermissions(selectedRoleId)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to remove permission from role"
      )
    } finally {
      setSaving(false)
    }
  }

  const createRole = async () => {
    if (!newRoleName.trim()) {
      setError("Role name is required.")
      return
    }

    setSaving(true)
    setError(null)

    try {
      await fetchJson("/api/identity/roles", {
        method: "POST",
        body: JSON.stringify({
          name: newRoleName.trim(),
          description: newRoleDescription.trim() || null,
          isActive: newRoleIsActive,
        }),
      })

      setNewRoleName("")
      setNewRoleDescription("")
      setNewRoleIsActive(true)
      void loadLists()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create role")
    } finally {
      setSaving(false)
    }
  }

  const createPermission = async () => {
    if (!newPermissionName.trim() || !newPermissionModule.trim() || !newPermissionAction.trim()) {
      setError("Permission name, module, and action are required.")
      return
    }

    setSaving(true)
    setError(null)

    try {
      await fetchJson("/api/identity/permissions", {
        method: "POST",
        body: JSON.stringify({
          name: newPermissionName.trim(),
          description: newPermissionDescription.trim() || null,
          module: newPermissionModule.trim(),
          action: newPermissionAction.trim(),
        }),
      })

      setNewPermissionName("")
      setNewPermissionDescription("")
      setNewPermissionModule("")
      setNewPermissionAction("")
      void loadLists()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create permission")
    } finally {
      setSaving(false)
    }
  }

  const availableRoles = roles.filter(
    (role) => !assignedRoles.some((assigned) => String(assigned.id) === String(role.id))
  )

  const availablePermissions = permissions.filter(
    (permission) =>
      !assignedPermissions.some(
        (assigned) => String(assigned.id) === String(permission.id)
      )
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

      {loading ? (
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
