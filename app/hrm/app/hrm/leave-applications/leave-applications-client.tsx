"use client"

import * as React from "react"
import {
  CalendarIcon,
  Loader2,
  Paperclip,
  Plus,
  X,
} from "lucide-react"
import { differenceInCalendarDays, format } from "date-fns"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { useApiQuery, useApiMutation, type components } from "@/lib/api"
import { PermissionGuard } from "@/components/auth/permission-guard"
import { useHrmAuth } from "@/components/auth/hrm-auth-guard"
import { ApiErrorView } from "@/components/ui/api-error-view"
import { cn } from "@/lib/utils"
import { formatDays, formatStatus, statusVariant } from "./leave-status"

type LeaveType = components["schemas"]["LeaveTypeResponse"]
type LeaveBalance = components["schemas"]["LeaveBalanceResponse"]
type LeaveApplication = components["schemas"]["LeaveApplicationResponse"]
type PagedLeaveApplications =
  components["schemas"]["PagedResponseOfLeaveApplicationResponse"]
type PagedLeaveTypes = components["schemas"]["PagedResponseOfLeaveTypeResponse"]

type SubmitForm = {
  leaveTypeId: string
  startDate: string
  endDate: string
  reason: string
  attachmentUrl: string
}

const EMPTY_FORM: SubmitForm = {
  leaveTypeId: "",
  startDate: "",
  endDate: "",
  reason: "",
  attachmentUrl: "",
}

/** Build a local-midnight Date from a `yyyy-MM-dd` string (no TZ drift). */
function toLocalDate(value: string) {
  const [year, month, day] = value.split("-").map(Number)
  return new Date(year, month - 1, day)
}

/** Inclusive day count between two `yyyy-MM-dd` strings. */
function estimateDays(start?: string, end?: string) {
  if (!start || !end) return 0
  const diff = differenceInCalendarDays(toLocalDate(end), toLocalDate(start))
  return diff >= 0 ? diff + 1 : 0
}

/** Whether an application can still be cancelled by the employee. */
function canCancel(status?: string | null) {
  if (!status) return false
  const value = status.toLowerCase()
  return (
    !value.includes("approv") &&
    !value.includes("reject") &&
    !value.includes("cancel") &&
    !value.includes("complete")
  )
}

function normalizeApplications(value: unknown): LeaveApplication[] {
  if (Array.isArray(value)) {
    return value.filter(
      (item): item is LeaveApplication =>
        Boolean(item && typeof item === "object"),
    )
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>
    const candidate = record.data
    if (Array.isArray(candidate)) {
      return candidate.filter(
        (item): item is LeaveApplication =>
          Boolean(item && typeof item === "object"),
      )
    }
  }

  return []
}

function normalizeLeaveTypes(value: unknown): LeaveType[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is LeaveType => Boolean(item && typeof item === "object"))
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>
    const candidate = record.data
    if (Array.isArray(candidate)) {
      return candidate.filter((item): item is LeaveType => Boolean(item && typeof item === "object"))
    }
  }

  return []
}

export default function LeaveApplicationsClient() {
  const { hasPermission } = useHrmAuth()
  const canSubmit = hasPermission("hrms.leave.submit")
  const canCancelOwn = hasPermission("hrms.leave.cancelOwn")

  const [submitOpen, setSubmitOpen] = React.useState(false)
  const [form, setForm] = React.useState<SubmitForm>(EMPTY_FORM)
  const [submitError, setSubmitError] = React.useState<Error | null>(null)

  const [cancelTarget, setCancelTarget] = React.useState<LeaveApplication | null>(
    null,
  )
  const [cancelReason, setCancelReason] = React.useState("")
  const [cancelError, setCancelError] = React.useState<Error | null>(null)

  const {
    data: leaveTypesRaw,
    loading: loadingLeaveTypes,
  } = useApiQuery<PagedLeaveTypes | LeaveType[]>("/api/v1/hrms/leave-types")

  const leaveTypes = React.useMemo(
    () => normalizeLeaveTypes(leaveTypesRaw),
    [leaveTypesRaw],
  )

  const activeLeaveTypes = React.useMemo(
    () => leaveTypes.filter((leaveType) => leaveType.isActive !== false),
    [leaveTypes],
  )

  const {
    data: balances,
    loading: loadingBalances,
    error: balancesError,
    refresh: refreshBalances,
  } = useApiQuery<LeaveBalance[]>("/api/v1/hrms/leave-applications/me/balance")

  const {
    data: applicationsRaw,
    loading: loadingApplications,
    error: applicationsError,
    refresh: refreshApplications,
  } = useApiQuery<PagedLeaveApplications | LeaveApplication[]>(
    "/api/v1/hrms/leave-applications/me",
  )

  const applications = React.useMemo(
    () => normalizeApplications(applicationsRaw),
    [applicationsRaw],
  )

  const { mutate: submitApplication, loading: submitting } = useApiMutation()
  const { mutate: cancelApplication, loading: cancelling } = useApiMutation()

  // Default the select to the first active leave type until the user picks one.
  const effectiveLeaveTypeId = form.leaveTypeId || (activeLeaveTypes[0] ? String(activeLeaveTypes[0].id) : "")

  const estimatedDays = estimateDays(form.startDate, form.endDate)

  const resetForm = () => {
    setForm((current) => ({
      ...current,
      startDate: "",
      endDate: "",
      reason: "",
      attachmentUrl: "",
    }))
    setSubmitError(null)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitError(null)

    if (!form.leaveTypeId || !form.startDate || !form.endDate || !form.reason.trim()) {
      return
    }

    if (toLocalDate(form.endDate) < toLocalDate(form.startDate)) {
      setSubmitError(new Error("End date cannot be earlier than the start date."))
      return
    }

    const body: components["schemas"]["SubmitLeaveApplicationRequest"] = {
      leaveTypeId: Number(effectiveLeaveTypeId),
      startDate: form.startDate,
      endDate: form.endDate,
      reason: form.reason.trim(),
    }

    if (form.attachmentUrl.trim()) {
      body.attachmentUrl = form.attachmentUrl.trim()
    }

    const success = await submitApplication({
      path: "/api/v1/hrms/leave-applications",
      method: "POST",
      body,
    })

    if (success) {
      resetForm()
      setSubmitOpen(false)
      void refreshApplications()
      void refreshBalances()
    }
  }

  const openCancel = (application: LeaveApplication) => {
    setCancelTarget(application)
    setCancelReason("")
    setCancelError(null)
  }

  const handleCancel = async () => {
    if (!cancelTarget) return
    setCancelError(null)

    if (!cancelReason.trim()) {
      setCancelError(new Error("A cancellation reason is required."))
      return
    }

    const success = await cancelApplication({
      path: `/api/v1/hrms/leave-applications/${cancelTarget.id}/cancel`,
      method: "POST",
      body: { reason: cancelReason.trim() },
    })

    if (success) {
      setCancelTarget(null)
      void refreshApplications()
      void refreshBalances()
    }
  }

  return (
    <PermissionGuard requiredPermission="hrms.leave.viewOwn">
      <div className="space-y-6">
        {canSubmit && (
          <div className="flex justify-end">
            <Button onClick={() => setSubmitOpen(true)} disabled={activeLeaveTypes.length === 0}>
              <Plus className="mr-2 h-4 w-4" />
              New application
            </Button>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>My leave balances</CardTitle>
            <CardDescription>
              Remaining, used, and pending days per leave type for the current school year.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingBalances ? (
              <div className="flex items-center justify-center p-6 text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading balances...
              </div>
            ) : balancesError ? (
              <ApiErrorView error={balancesError} fullScreen />
            ) : !balances || balances.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted-foreground">
                No leave balances found.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {balances.map((balance) => {
                  const remaining = Number(balance.remainingDays ?? 0)
                  const total = Number(balance.totalDays ?? 0)
                  const pct = total > 0 ? Math.round((remaining / total) * 100) : 0
                  return (
                    <div
                      key={`${balance.leaveTypeId}-${balance.leaveTypeCode}`}
                      className="rounded-lg border p-4"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{balance.leaveTypeName}</p>
                        <Badge variant={remaining <= 0 ? "destructive" : "secondary"}>
                          {remaining <= 0 ? "Exhausted" : `${pct}% left`}
                        </Badge>
                      </div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        {balance.leaveTypeCode}
                      </p>
                      <p className="mt-3 text-2xl font-semibold">
                        {formatDays(balance.remainingDays)}
                        <span className="text-sm font-normal text-muted-foreground">
                          {" "}/ {formatDays(balance.totalDays)} days
                        </span>
                      </p>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Used</p>
                          <p>{formatDays(balance.usedDays)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Pending</p>
                          <p>{formatDays(balance.pendingDays)}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My applications</CardTitle>
            <CardDescription>
              Track the status of leave applications you have submitted.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Leave type</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingApplications ? (
                    <TableRow>
                      <TableCell colSpan={6} className="p-6 text-center">
                        <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading applications...
                        </span>
                      </TableCell>
                    </TableRow>
                  ) : applicationsError ? (
                    <TableRow>
                      <TableCell colSpan={6} className="p-0">
                        <ApiErrorView error={applicationsError} fullScreen />
                      </TableCell>
                    </TableRow>
                  ) : applications.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="p-6 text-center text-sm text-muted-foreground"
                      >
                        You have not submitted any leave applications yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    applications.map((application) => (
                      <TableRow key={String(application.id)}>
                        <TableCell className="font-medium">
                          {application.leaveTypeName}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{application.startDate}</p>
                            <p className="text-muted-foreground">
                              to {application.endDate}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{formatDays(application.totalDays)}</TableCell>
                        <TableCell>
                          <Badge variant={statusVariant(application.status)}>
                            {formatStatus(application.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {application.submittedAtUtc
                            ? format(new Date(application.submittedAtUtc), "MMM d, yyyy")
                            : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          {canCancelOwn && canCancel(application.status) ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openCancel(application)}
                              disabled={cancelling}
                            >
                              <X className="mr-2 h-4 w-4" />
                              Cancel
                            </Button>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={submitOpen} onOpenChange={setSubmitOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New leave application</DialogTitle>
            <DialogDescription>
              Select a leave type and the dates you will be away.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="leave-type">Leave type</Label>
              <Select
                value={effectiveLeaveTypeId}
                onValueChange={(value) =>
                  setForm((current) => ({ ...current, leaveTypeId: value }))
                }
                disabled={loadingLeaveTypes || activeLeaveTypes.length === 0}
              >
                <SelectTrigger id="leave-type">
                  <SelectValue
                    placeholder={
                      loadingLeaveTypes
                        ? "Loading leave types..."
                        : activeLeaveTypes.length === 0
                          ? "No leave types available"
                          : "Select a leave type"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {activeLeaveTypes.map((leaveType) => (
                    <SelectItem key={String(leaveType.id)} value={String(leaveType.id)}>
                      {leaveType.name}
                      {leaveType.requiresMedicalCertificate ? " (medical cert. required)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Start date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full justify-start font-normal",
                        !form.startDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 size-4" />
                      {form.startDate
                        ? format(toLocalDate(form.startDate), "PPP")
                        : "Select start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={form.startDate ? toLocalDate(form.startDate) : undefined}
                      onSelect={(date) =>
                        setForm((current) => ({
                          ...current,
                          startDate: date ? format(date, "yyyy-MM-dd") : "",
                        }))
                      }
                      captionLayout="dropdown"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>End date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full justify-start font-normal",
                        !form.endDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 size-4" />
                      {form.endDate
                        ? format(toLocalDate(form.endDate), "PPP")
                        : "Select end date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={form.endDate ? toLocalDate(form.endDate) : undefined}
                      onSelect={(date) =>
                        setForm((current) => ({
                          ...current,
                          endDate: date ? format(date, "yyyy-MM-dd") : "",
                        }))
                      }
                      disabled={
                        form.startDate
                          ? { before: toLocalDate(form.startDate) }
                          : undefined
                      }
                      captionLayout="dropdown"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {estimatedDays > 0 ? (
              <p className="text-sm text-muted-foreground">
                Estimated duration: <span className="font-medium text-foreground">{estimatedDays} day{estimatedDays === 1 ? "" : "s"}</span>
              </p>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                value={form.reason}
                onChange={(event) =>
                  setForm((current) => ({ ...current, reason: event.target.value }))
                }
                placeholder="Briefly describe the reason for your leave"
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="attachment">
                <span className="inline-flex items-center gap-1">
                  <Paperclip className="size-3.5" />
                  Attachment URL (optional)
                </span>
              </Label>
              <Input
                id="attachment"
                value={form.attachmentUrl}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    attachmentUrl: event.target.value,
                  }))
                }
                placeholder="https://… (e.g. medical certificate link)"
              />
            </div>

            {submitError ? (
              <p className="text-sm text-destructive">{submitError.message}</p>
            ) : null}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm()
                  setSubmitOpen(false)
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  submitting ||
                  loadingLeaveTypes ||
                  !effectiveLeaveTypeId ||
                  !form.startDate ||
                  !form.endDate ||
                  !form.reason.trim()
                }
              >
                {submitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                Submit application
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(cancelTarget)} onOpenChange={(open) => !open && setCancelTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel leave application</DialogTitle>
            <DialogDescription>
              Cancelling <strong>{cancelTarget?.leaveTypeName}</strong> for{" "}
              {cancelTarget?.startDate} – {cancelTarget?.endDate}. This cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="cancel-reason">Reason</Label>
            <Textarea
              id="cancel-reason"
              value={cancelReason}
              onChange={(event) => setCancelReason(event.target.value)}
              placeholder="Why are you cancelling this application?"
              rows={3}
              required
            />
          </div>

          {cancelError ? (
            <p className="text-sm text-destructive">{cancelError.message}</p>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelTarget(null)}>
              Keep application
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={cancelling || !cancelReason.trim()}
            >
              {cancelling ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <X className="mr-2 h-4 w-4" />
              )}
              Cancel application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PermissionGuard>
  )
}
