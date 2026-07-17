"use client"

import * as React from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PermissionGuard } from "@/components/auth/permission-guard"
import { useHrmAuth } from "@/components/auth/hrm-auth-guard"
import LeaveApplicationsClient from "./leave-applications-client"
import ApprovalsTab from "./approvals-tab"

export default function LeaveApplicationsPage() {
  const { hasPermission } = useHrmAuth()

  const canViewOwn = hasPermission("hrms.leave.viewOwn")
  const canApproveDept = hasPermission("hrms.leaveApplications.approveDept")
  const canApproveHr = hasPermission("hrms.leaveApplications.approveHr")

  const visibleTabs = [
    canViewOwn && "my-applications",
    canApproveDept && "dept-approvals",
    canApproveHr && "hr-approvals",
  ].filter(Boolean) as string[]

  return (
    <PermissionGuard
      requiredPermissions={[
        "hrms.leave.viewOwn",
        "hrms.leaveApplications.approveDept",
        "hrms.leaveApplications.approveHr",
      ]}
      mode="any"
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal">
            Leave Applications
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your leave balances, applications, and pending approvals.
          </p>
        </div>

        {visibleTabs.length <= 1 ? (
          <>
            {canViewOwn && <LeaveApplicationsClient />}
            {!canViewOwn && canApproveDept && <ApprovalsTab stage="dept" />}
            {!canViewOwn && !canApproveDept && canApproveHr && (
              <ApprovalsTab stage="hr" />
            )}
          </>
        ) : (
          <Tabs defaultValue={visibleTabs[0]}>
            <TabsList>
              {canViewOwn && (
                <TabsTrigger value="my-applications">My Applications</TabsTrigger>
              )}
              {canApproveDept && (
                <TabsTrigger value="dept-approvals">
                  Department Approvals
                </TabsTrigger>
              )}
              {canApproveHr && (
                <TabsTrigger value="hr-approvals">HR Approvals</TabsTrigger>
              )}
            </TabsList>
            {canViewOwn && (
              <TabsContent value="my-applications" className="mt-4">
                <LeaveApplicationsClient />
              </TabsContent>
            )}
            {canApproveDept && (
              <TabsContent value="dept-approvals" className="mt-4">
                <ApprovalsTab stage="dept" />
              </TabsContent>
            )}
            {canApproveHr && (
              <TabsContent value="hr-approvals" className="mt-4">
                <ApprovalsTab stage="hr" />
              </TabsContent>
            )}
          </Tabs>
        )}
      </div>
    </PermissionGuard>
  )
}
