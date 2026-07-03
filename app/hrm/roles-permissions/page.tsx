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
  Building2,
  Info,
} from "lucide-react"

type User = components["schemas"]["UserResponse"]

type PagedUsers = components["schemas"]["PagedResponseOfUserResponse"]
type Role = components["schemas"]["RoleResponse"]
type PagedRoles = components["schemas"]["PagedResponseOfRoleResponse"]
type Permission = components["schemas"]["PermissionResponse"]
type PagedPermissions = components["schemas"]["PagedResponseOfPermissionResponse"]
type Department = components["schemas"]["DepartmentResponse"]
type PagedDepartments = components["schemas"]["PagedResponseOfDepartmentResponse"]
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
const getDepartmentLabel = (department: Department) =>
  `${department.name} (${department.code})`

export default function RolesPage() {
  const [activeTab, setActiveTab] = React.useState<"users" | "roles" | "departments" | "create">("users")
  const [selectedUserId, setSelectedUserId] = React.useState<string>("")
  const [selectedRoleId, setSelectedRoleId] = React.useState<string>("")
  const [selectedDepartmentId, setSelectedDepartmentId] = React.useState<string>("")
  const [assignedRoles, setAssignedRoles] = React.useState<Role[]>([])
  const [assignedPermissions, setAssignedPermissions] = React.useState<Permission[]>([])
  const [assignedDepartments, setAssignedDepartments] = React.useState<Department[]>([])
  const [selectedAssignRoleId, setSelectedAssignRoleId] = React.useState<string>("")
  const [selectedAssignPermissionId, setSelectedAssignPermissionId] = React.useState<string>("")
  const [selectedAssignDepartmentId, setSelectedAssignDepartmentId] = React.useState<string>("")
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

  const { data: departmentsPaged, refresh: refreshDepartments } =
    useApiQuery<PagedDepartments>(
      "/api/organization/departments",
      { Page: 1, PageSize: 100, SortBy: "id" },
      { onError: handleError },
    )

  const users = usersPaged?.data ?? []
  const roles = rolesPaged?.data ?? []
  const permissions = permissionsPaged?.data ?? []
  const departments = departmentsPaged?.data ?? []

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

  React.useEffect(() => {
    if (!selectedDepartmentId) setAssignedDepartments([])
  }, [selectedDepartmentId])

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

  const assignDepartmentToRole = () =>
    run(async () => {
      if (!selectedDepartmentId || !selectedAssignDepartmentId) {
        setError("Select a department and a role to assign.")
        return false
      }
      const ok = await command({
        path: `/api/organization/departments/${selectedDepartmentId}/roles/${selectedAssignDepartmentId}`,
        method: "POST",
      })
      if (ok) {
        // Refresh the assigned roles for this department
        const departmentRoles = await command({
          path: `/api/organization/departments/${selectedDepartmentId}/roles`,
          method: "GET",
        })
        if (departmentRoles) {
          setAssignedDepartments(departmentRoles as unknown as Department[])
        }
        setSelectedAssignDepartmentId("")
      }
      return ok
    }, "Unable to assign role to department")

  const removeDepartmentFromRole = (roleId: number | string) =>
    run(async () => {
      if (!selectedDepartmentId) return false
      const ok = await command({
        path: `/api/organization/departments/${selectedDepartmentId}/roles/${roleId}`,
        method: "DELETE",
      })
      if (ok) {
        // Refresh the assigned roles for this department
        const departmentRoles = await command({
          path: `/api/organization/departments/${selectedDepartmentId}/roles`,
          method: "GET",
        })
        if (departmentRoles) {
          setAssignedDepartments(departmentRoles as unknown as Department[])
        }
      }
      return ok
    }, "Unable to remove role from department")

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

  const listLoading = !usersPaged && !rolesPaged && !permissionsPaged && !departmentsPaged

  const availableRoles = roles.filter(
    (role) => !assignedRoles.some((assigned) => String(assigned.id) === String(role.id)),
  )

  const availablePermissions = permissions.filter(
    (permission) =>
      !assignedPermissions.some(
        (assigned) => String(assigned.id) === String(permission.id),
      ),
  )

  const availableRolesForDepartment = roles.filter(
    (role) => !assignedDepartments.some((assigned) => String(assigned.id) === String(role.id)),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Roles & Permissions Management
        </h1>
        <p className="text-muted-foreground">
          Manage user roles, role permissions, and create new roles and permissions for your organization.
        </p>
      </div>


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
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading identity data...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {!listLoading && (
        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              User Roles
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Role Permissions
            </TabsTrigger>
            <TabsTrigger value="departments" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Department Roles
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
                      <Button
                        onClick={assignRoleToUser}

                        disabled={!selectedUserId || !selectedAssignRoleId || saving}
                        size="default"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border">
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
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => removeRoleFromUser(role.id)}
                                disabled={saving}
                              >
                                <Trash2 className="mr-1 h-3 w-3" />
                                Remove
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
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
                      <Button
                        onClick={assignPermissionToRole}
                        disabled={!selectedRoleId || !selectedAssignPermissionId || saving}
                        size="default"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border">
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
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => removePermissionFromRole(permission.id)}
                                disabled={saving}
                              >
                                <Trash2 className="mr-1 h-3 w-3" />
                                Remove
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="departments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Assign Roles to Departments
                </CardTitle>
                <CardDescription>
                  Select a department and assign roles to define which roles are available in that department.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="department-select-assign" className="text-base font-medium">
                      Select Department
                    </Label>
                    <Select value={selectedDepartmentId} onValueChange={setSelectedDepartmentId}>
                      <SelectTrigger id="department-select-assign">
                        <SelectValue placeholder="Choose a department..." />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={String(dept.id)} value={String(dept.id)}>
                            {getDepartmentLabel(dept)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="assign-department-role-select" className="text-base font-medium">
                      Assign Role
                    </Label>
                    <div className="flex gap-2">
                      <Select
                        value={selectedAssignDepartmentId}
                        onValueChange={setSelectedAssignDepartmentId}
                        disabled={!selectedDepartmentId}
                      >
                        <SelectTrigger id="assign-department-role-select">
                          <SelectValue placeholder={selectedDepartmentId ? "Choose a role..." : "Select department first"} />
                        </SelectTrigger>
                        <SelectContent>
                          {availableRolesForDepartment.map((role) => (
                            <SelectItem key={String(role.id)} value={String(role.id)}>
                              {getRoleLabel(role)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={assignDepartmentToRole}
                        disabled={!selectedDepartmentId || !selectedAssignDepartmentId || saving}
                        size="default"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border">
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
                      {!selectedDepartmentId ? (
                        <TableRow>
                          <TableCell colSpan={5} className="h-32 text-center">
                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                              <Building2 className="h-8 w-8 opacity-50" />
                              <p className="text-sm">Select a department above to view its assigned roles</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : assignedDepartments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="h-32 text-center">
                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                              <Shield className="h-8 w-8 opacity-50" />
                              <p className="text-sm">No roles assigned to this department yet</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        assignedDepartments.map((dept) => (
                          <TableRow key={String(dept.id)}>
                            <TableCell className="font-mono text-xs">{dept.id}</TableCell>
                            <TableCell className="font-medium">{dept.name}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {dept.code || "—"}
                            </TableCell>
                            <TableCell>
                              <Badge variant={dept.isActive ? "default" : "secondary"}>
                                {dept.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => removeDepartmentFromRole(dept.id)}
                                disabled={saving}
                              >
                                <Trash2 className="mr-1 h-3 w-3" />
                                Remove
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
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
                  Define a new role with a name and description. Use the Department Roles tab to assign this role to departments.
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
                    <Button type="submit" disabled={saving || !newRoleName.trim()}>
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
    </div>
  )
}
