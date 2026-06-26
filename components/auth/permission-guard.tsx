"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { ShieldCheck } from "lucide-react"
import { useHrmAuth } from "./hrm-auth-guard"

interface PermissionGuardProps {
  requiredPermissions: string[]
  mode?: "any" | "all"
  fallback?: React.ReactNode
  children: React.ReactNode
}

export function PermissionGuard({
  requiredPermissions,
  mode = "all",
  fallback,
  children,
}: PermissionGuardProps) {
  const { hasPermission } = useHrmAuth()

  const isAuthorized =
    mode === "any"
      ? requiredPermissions.some(hasPermission)
      : requiredPermissions.every(hasPermission)

  if (isAuthorized) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <div className="w-full max-w-md rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Unauthorized</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              You do not have the required permissions to view this page.
            </p>
          </div>
        </div>
        <Button className="mt-6 w-full" variant="outline" onClick={() => window.history.back()}>
          Go back
        </Button>
      </div>
    </main>
  )
}
