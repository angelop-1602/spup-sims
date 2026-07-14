"use client"

import * as React from "react"
import { useHrmAuth } from "./hrm-auth-guard"
import { ErrorPage } from "@/components/ui/error-page"

interface PermissionGuardProps {
  /** A single required permission (shorthand for `requiredPermissions: [permission]`). */
  requiredPermission?: string
  /** One or more required permissions. */
  requiredPermissions?: string[]
  mode?: "any" | "all"
  fallback?: React.ReactNode
  children: React.ReactNode
}

export function PermissionGuard({
  requiredPermission,
  requiredPermissions,
  mode = "all",
  fallback,
  children,
}: PermissionGuardProps) {
  const { hasPermission, currentUser } = useHrmAuth()

  const permissions = requiredPermissions ?? (
    requiredPermission ? [requiredPermission] : []
  )

  // Super admins bypass all permission checks
  const isAuthorized =
    currentUser?.isSuperAdmin ||
    (mode === "any"
      ? permissions.some(hasPermission)
      : permissions.every(hasPermission))

  if (isAuthorized) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  return <ErrorPage status={403} fullScreen />
}
