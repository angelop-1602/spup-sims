"use client"

import { Loader2 } from "lucide-react"

interface EmployeeDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  isLoading: boolean
  employee: any | null
  getInitials: (name: string) => string
}

export function EmployeeDetailsModal({
  isOpen,
  onClose,
  isLoading,
  employee,
  getInitials,
}: EmployeeDetailsModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-lg overflow-hidden rounded-xl border bg-background shadow-lg animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold">Employee Profile Summary</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Close
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-sm text-muted-foreground gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span>Retrieving employee profile...</span>
            </div>
          ) : employee ? (
            <div className="space-y-5">
              {/* Top Identity Block */}
              <div className="flex items-center gap-4 border-b pb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-base font-semibold">
                  {getInitials(employee.fullName || "")}
                </div>
                <div>
                  <h3 className="font-semibold text-base">{employee.fullName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {employee.employeeNumber} · {employee.employeeType || "Regular"}
                  </p>
                </div>
              </div>

              {/* Core Employment Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="block text-xs font-medium text-muted-foreground uppercase tracking-wider">Department</span>
                  <span className="font-medium">{employee.department || "—"}</span>
                </div>
                <div>
                  <span className="block text-xs font-medium text-muted-foreground uppercase tracking-wider">Designation</span>
                  <span className="font-medium">{employee.designation || "—"}</span>
                </div>
              </div>

              {/* Contact Information */}
              <div className="border-t pt-4 space-y-2 text-sm">
                <h4 className="font-medium text-xs uppercase tracking-wider text-muted-foreground">Contact Details</h4>
                <div><span className="text-muted-foreground">Email:</span> {employee.email}</div>
                <div><span className="text-muted-foreground">Mobile:</span> {employee.mobileNumber || "—"}</div>
                <div><span className="text-muted-foreground">Phone Link:</span> {employee.phoneNumber || "—"}</div>
              </div>

              {/* Contract Timelines */}
              <div className="border-t pt-4 space-y-2 text-sm">
                <h4 className="font-medium text-xs uppercase tracking-wider text-muted-foreground">Timeline Status</h4>
                <div>
                  <span className="text-muted-foreground">Date Hired:</span>{" "}
                  {employee.dateHired ? new Date(employee.dateHired).toLocaleDateString("en-US", { dateStyle: "medium" }) : "—"}
                </div>
                <div>
                  <span className="text-muted-foreground">Regularization Date:</span>{" "}
                  {employee.dateRegularized ? new Date(employee.dateRegularized).toLocaleDateString("en-US", { dateStyle: "medium" }) : "—"}
                </div>
                <div><span className="text-muted-foreground">Classification:</span> {employee.employmentCategory || "—"}</div>
              </div>

              {/* Other Information */}
              <div className="border-t pt-4 text-sm">
                <h4 className="font-medium text-xs uppercase tracking-wider text-muted-foreground mb-1">Additional Information</h4>
                <div><span className="text-muted-foreground">Affiliation/Religion:</span> {employee.religion || "—"}</div>
              </div>

            </div>
          ) : (
            <div className="text-center py-6 text-sm text-destructive">
              Failed to parse employee profile metadata.
            </div>
          )}
        </div>

      </div>
    </div>
  )
}