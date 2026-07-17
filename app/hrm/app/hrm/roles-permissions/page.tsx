"use client"

import * as React from "react"
import { useApiQuery, useApiMutation, type components } from "@/lib/api"
import { PermissionGuard } from "@/components/auth/permission-guard"
import { useHrmAuth } from "@/components/auth/hrm-auth-guard"
import { TableTemplate } from "@/components/custom/table-template"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ApiErrorView } from "@/components/ui/api-error-view"
import { Skeleton } from "@/components/ui/skeleton"
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Loader2,
  Plus,
  Trash2,
  Users,
  Shield,
  Key,
  Info,
} from "lucide-react"

type User = components["schemas"]["UserResponse"]

type PagedUsers = components["schemas"]["PagedResponseOfUserResponse"]
type Role = components["schemas"]["RoleResponse"]
type PagedRoles = components["schemas"]["PagedResponseOfRoleResponse"]
type Permission = components["schemas"]["PermissionResponse"]
type PagedPermissions = components["schemas"]["PagedResponseOfPermissionResponse"]
type UserRoles = components["schemas"]["UserRolesResponse"]
type CreateRoleRequest = components["schemas"]["CreateRoleRequest"]
type CreatePermissionRequest = components["schemas"]["CreatePermissionRequest"]

const getUserLabel = (user: User) => `${user.username} (${user.email})`
const getRoleLabel = (role: Role) => role.name
const getPermissionLabel = (permission: Permission) =>
  `${permission.module}.${permission.action}`
const getPermissionCode = (permission: Permission) =>
  `${permission.module}.${permission.action}`

export default function RolesPage() {
  const { hasPermission } = useHrmAuth()

  const canViewUsers    = hasPermission("identity.users.view")
  const canViewRoles    = hasPermission("identity.roles.view")
  const canViewPerms    = hasPermission("identity.permissions.view")
  const canCreateRole   = hasPermission("identity.roles.create")
  const canDeleteRole   = hasPermission("identity.roles.delete")
  const canCreatePerm   = hasPermission("identity.permissions.create")
  const canDeletePerm   = hasPermission("identity.permissions.delete")
  const canUpdateUsers  = hasPermission("identity.users.update")

  const [activeTab, setActiveTab] = React.useState<"users" | "roles" | "permissions" | "create">("users")
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

  const handleError = React.useCallback(
    (err: Error) => setError(err.message),
    [],
  )

  const { data: usersPaged, refresh: refreshUsers, error: usersError } = useApiQuery<PagedUsers>(
    "/api/v1/identity/users",
    { Page: 1, PageSize: 100, SortBy: "id" },
    { onError: handleError },
  )

  const { data: rolesPaged, refresh: refreshRoles } = useApiQuery<PagedRoles>(
    "/api/v1/identity/roles",
    { Page: 1, PageSize: 100, SortBy: "id" },
    { onError: handleError },
  )

  const { data: permissionsPaged, refresh: refreshPermissions } =
    useApiQuery<PagedPermissions>(
      "/api/v1/identity/permissions",
      { Page: 1, PageSize: 100, SortBy: "id" },
      { onError: handleError },
    )

  const users = React.useMemo(() => usersPaged?.data ?? [], [usersPaged])
  const roles = React.useMemo(() => rolesPaged?.data ?? [], [rolesPaged])
  const permissions = React.useMemo(() => permissionsPaged?.data ?? [], [permissionsPaged])

  const { data: userRoles, refresh: refreshUserRoles } = useApiQuery<UserRoles>(
    selectedUserId ? `/api/v1/identity/users/${selectedUserId}/roles` : undefined,
    undefined,
    {
      enabled: Boolean(selectedUserId),
      onError: handleError,
    },
  )


  React.useEffect(() => {
    setAssignedRoles(userRoles?.roles ?? [])
  }, [userRoles])

  React.useEffect(() => {
    if (!selectedUserId) setAssignedRoles([])
  }, [selectedUserId])

  React.useEffect(() => {
    if (!selectedRoleId) {
      setAssignedPermissions([])
      return
    }
    // No standalone GET endpoint exists for role permissions in the API schema.
    // Permissions are seeded from the response of POST/DELETE operations below.
    setAssignedPermissions([])
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
        path: `/api/v1/identity/users/${selectedUserId}/roles/${selectedAssignRoleId}`,
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
        path: `/api/v1/identity/users/${selectedUserId}/roles/${roleId}`,
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
        path: `/api/v1/identity/roles/${selectedRoleId}/permissions/${selectedAssignPermissionId}`,
        method: "POST",
      })
      if (ok) {
        // POST returns RolePermissionsResponse but useApiMutation discards the
        // body. Update optimistically from the local permissions list.
        const perm = permissions.find(
          (p) => String(p.id) === String(selectedAssignPermissionId),
        )
        if (perm) setAssignedPermissions((prev) => [...prev, perm])
        setSelectedAssignPermissionId("")
      }
      return ok
    }, "Unable to assign permission to role")

  const removePermissionFromRole = (permissionId: number | string) =>
    run(async () => {
      if (!selectedRoleId) return false
      const ok = await command({
        path: `/api/v1/identity/roles/${selectedRoleId}/permissions/${permissionId}`,
        method: "DELETE",
      })
      if (ok) {
        // DELETE returns 204 — remove optimistically from local state
        setAssignedPermissions((prev) =>
          prev.filter((p) => String(p.id) !== String(permissionId)),
        )
      }
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
        path: "/api/v1/identity/roles",
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
        path: "/api/v1/identity/permissions",
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
    <PermissionGuard requiredPermission="identity.roles.view">
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Roles & Permissions Management
        </h1>
        <p className="text-muted-foreground">
          Manage user roles, role permissions, and create new roles and permissions for your organization.
        </p>
      </div>


      {usersError ? (
        <ApiErrorView error={usersError} onRetry={refreshUsers} fullScreen />
      ) : (
      <>
      {error && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="flex items-start gap-3 pt-6">
            <Info className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-destructive">Error</h3>
              <p className="text-sm text-destructive/90">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {listLoading && (
        <Card>
          <CardContent className="space-y-4 py-6" aria-busy="true">
            <span className="sr-only" role="status">
              Loading identity data
            </span>
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      )}

      {!listLoading && (
        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              User Roles
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Role Permissions
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Create New
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Assign Roles to Users
                </CardTitle>

                <CardDescription>
                  Select a user and assign roles to grant them specific permissions within the system.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="user-select" className="text-base font-medium">
                      Select User
                    </Label>
                    <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                      <SelectTrigger id="user-select">
                        <SelectValue placeholder="Choose a user..." />
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

                  <div className="space-y-2">
                    <Label htmlFor="assign-role-select" className="text-base font-medium">
                      Assign Role
                    </Label>
                    <div className="flex gap-2">
                      <Select
                        value={selectedAssignRoleId}
                        onValueChange={setSelectedAssignRoleId}
                        disabled={!selectedUserId}
                      >
                        <SelectTrigger id="assign-role-select">
                          <SelectValue placeholder={selectedUserId ? "Choose a role..." : "Select user first"} />
                        </SelectTrigger>
                        <SelectContent>
                          {availableRoles.map((role) => (
                            <SelectItem key={String(role.id)} value={String(role.id)}>
                              {getRoleLabel(role)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {canUpdateUsers && (
                      <Button
                        onClick={assignRoleToUser}
                        disabled={!selectedUserId || !selectedAssignRoleId || saving}
                        size="default"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      )}
                    </div>
                  </div>
                </div>

                <TableTemplate label="Assigned user roles table">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Role Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {!selectedUserId ? (
                        <TableRow>
                          <TableCell colSpan={5} className="h-32 text-center">
                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                              <Users className="h-8 w-8 opacity-50" />
                              <p className="text-sm">Select a user above to view their assigned roles</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : assignedRoles.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="h-32 text-center">
                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                              <Shield className="h-8 w-8 opacity-50" />
                              <p className="text-sm">No roles assigned to this user yet</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        assignedRoles.map((role) => (
                          <TableRow key={String(role.id)}>
                            <TableCell className="font-mono text-xs">{role.id}</TableCell>
                            <TableCell className="font-medium">{getRoleLabel(role)}</TableCell>
                            <TableCell className="text-muted-foreground">

                              {role.description || "—"}
                            </TableCell>
                            <TableCell>
                              <Badge variant={role.isActive ? "default" : "secondary"}>
                                {role.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {canUpdateUsers && (
                              <Button
                                variant="destructive"
                                size="icon-sm"
                                onClick={() => removeRoleFromUser(role.id)}
                                disabled={saving}
                                aria-label={`Remove ${getRoleLabel(role)}`}
                              >
                                <Trash2 aria-hidden="true" className="h-4 w-4" />
                              </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableTemplate>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Assign Permissions to Roles
                </CardTitle>
                <CardDescription>
                  Select a role and assign permissions to define what actions users with that role can perform.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="role-select" className="text-base font-medium">
                      Select Role
                    </Label>
                    <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                      <SelectTrigger id="role-select">
                        <SelectValue placeholder="Choose a role..." />

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

                  <div className="space-y-2">
                    <Label htmlFor="assign-permission-select" className="text-base font-medium">
                      Assign Permission
                    </Label>
                    <div className="flex gap-2">
                      <Select
                        value={selectedAssignPermissionId}
                        onValueChange={setSelectedAssignPermissionId}
                        disabled={!selectedRoleId}
                      >
                        <SelectTrigger id="assign-permission-select">
                          <SelectValue placeholder={selectedRoleId ? "Choose a permission..." : "Select role first"} />
                        </SelectTrigger>
                        <SelectContent>
                          {availablePermissions.map((permission) => (
                            <SelectItem key={String(permission.id)} value={String(permission.id)}>
                              {getPermissionLabel(permission)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {canCreatePerm && (
                      <Button
                        onClick={assignPermissionToRole}
                        disabled={!selectedRoleId || !selectedAssignPermissionId || saving}
                        size="default"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      )}
                    </div>
                  </div>
                </div>

                <TableTemplate label="Assigned role permissions table">
                  <Table>
                    <TableHeader>

                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Permission Name</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Module</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {!selectedRoleId ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-32 text-center">
                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                              <Shield className="h-8 w-8 opacity-50" />
                              <p className="text-sm">Select a role above to view its permissions</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : assignedPermissions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-32 text-center">
                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                              <Key className="h-8 w-8 opacity-50" />
                              <p className="text-sm">No permissions assigned to this role yet</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        assignedPermissions.map((permission) => (
                          <TableRow key={String(permission.id)}>
                            <TableCell className="font-mono text-xs">{permission.id}</TableCell>
                            <TableCell className="font-medium">{permission.name}</TableCell>
                            <TableCell>
                              <code className="rounded bg-muted px-2 py-1 text-xs">
                                {getPermissionCode(permission)}
                              </code>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{permission.module}</Badge>
                            </TableCell>
                            <TableCell>

                              <Badge variant="outline">{permission.action}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {canDeletePerm && (
                              <Button
                                variant="destructive"
                                size="icon-sm"
                                onClick={() => removePermissionFromRole(permission.id)}
                                disabled={saving}
                                aria-label={`Remove ${getPermissionLabel(permission)}`}
                              >
                                <Trash2 aria-hidden="true" className="h-4 w-4" />
                              </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableTemplate>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Create New Role
                </CardTitle>
                <CardDescription>
                  Define a new role with a name and description.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    createRole()
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="new-role-name">
                      Role Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="new-role-name"
                      value={newRoleName}
                      onChange={(e) => setNewRoleName(e.target.value)}
                      placeholder="e.g., HR Manager, Developer"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-role-description">Description</Label>
                    <Textarea
                      id="new-role-description"
                      value={newRoleDescription}
                      onChange={(e) => setNewRoleDescription(e.target.value)}
                      placeholder="Describe the purpose and responsibilities of this role..."
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label className="text-base">Role Status</Label>
                      <p className="text-sm text-muted-foreground">
                        {newRoleIsActive
                          ? "This role will be active and assignable immediately"
                          : "This role will be inactive and cannot be assigned"}
                      </p>

                    </div>
                    <Button
                      type="button"
                      variant={newRoleIsActive ? "default" : "outline"}
                      onClick={() => setNewRoleIsActive(!newRoleIsActive)}
                    >
                      {newRoleIsActive ? "Active" : "Inactive"}
                    </Button>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setNewRoleName("")
                        setNewRoleDescription("")
                        setNewRoleIsActive(true)
                      }}
                    >
                      Clear
                    </Button>
                    <Button type="submit" disabled={saving || !newRoleName.trim() || !canCreateRole}>
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Create Role
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Create New Permission
                </CardTitle>
                <CardDescription>

                  Define a new permission by specifying a module and action. The permission code will be generated automatically.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    createPermission()
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="new-permission-name">
                      Permission Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="new-permission-name"
                      value={newPermissionName}
                      onChange={(e) => setNewPermissionName(e.target.value)}
                      placeholder="e.g., View Employees, Create Reports"
                      required
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="new-permission-module">
                        Module <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="new-permission-module"
                        value={newPermissionModule}
                        onChange={(e) => setNewPermissionModule(e.target.value)}
                        placeholder="e.g., hrm, organization"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-permission-action">
                        Action <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="new-permission-action"
                        value={newPermissionAction}
                        onChange={(e) => setNewPermissionAction(e.target.value)}
                        placeholder="e.g., view, create, edit, delete"

                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-permission-description">Description</Label>
                    <Textarea
                      id="new-permission-description"
                      value={newPermissionDescription}
                      onChange={(e) => setNewPermissionDescription(e.target.value)}
                      placeholder="Describe what this permission allows users to do..."
                      rows={2}
                    />
                  </div>

                  {(newPermissionModule.trim() || newPermissionAction.trim()) && (
                    <div className="rounded-lg border border-dashed bg-muted/50 p-4">
                      <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Generated Permission Code</p>
                          <code className="block rounded bg-background px-3 py-2 text-sm font-mono">
                            {newPermissionModule.trim() && newPermissionAction.trim()
                              ? `${newPermissionModule.trim()}.${newPermissionAction.trim()}`
                              : "Module and action required"}
                          </code>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setNewPermissionName("")
                        setNewPermissionDescription("")
                        setNewPermissionModule("")
                        setNewPermissionAction("")
                      }}
                    >
                      Clear
                    </Button>

                    <Button
                      type="submit"
                      disabled={
                        saving ||
                        !canCreatePerm ||
                        !newPermissionName.trim() ||
                        !newPermissionModule.trim() ||
                        !newPermissionAction.trim()
                      }
                    >
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Create Permission
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
      </>
      )}
    </div>
    </PermissionGuard>
  )
}
