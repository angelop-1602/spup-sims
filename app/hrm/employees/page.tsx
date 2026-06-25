"use client"

import { useEffect, useState } from "react"
import { useMsal } from "@azure/msal-react"
import { loginRequest } from "@/lib/authConfig"
import { Loader2, Search, Users } from "lucide-react"

interface Employee {
  id: number
  employeeNumber: string
  firstName: string
  middleName: string | null
  lastName: string
  suffix: string | null
  fullName: string
  email: string
  mobileNumber: string | null
  phoneNumber: string | null
  department: string | null
  designation: string | null
  employeeType: string | null
  dateHired: string
  isActive: boolean
}

interface EmployeesResponse {
  success: boolean
  message: string
  data: {
    data: Employee[]
    page: number
    pageSize: number
    totalRecords: number
    totalPages: number
  }
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export default function EmployeesPage() {
  const { instance, accounts } = useMsal()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    async function fetchEmployees() {
      if (accounts.length === 0) return

      setIsLoading(true)
      setError(null)
      try {
        const tokenResponse = await instance.acquireTokenSilent({
          ...loginRequest,
          account: accounts[0],
        })

        const res = await fetch(
          `/api/v1/hrms/employees?page=${page}&pageSize=${pageSize}`,
          {
            signal: controller.signal,
            headers: {
              Authorization: `Bearer ${tokenResponse.accessToken}`,
              "Content-Type": "application/json",
            },
          }
        )
        if (!res.ok) {
          throw new Error(`Request failed (${res.status})`)
        }
        const json: EmployeesResponse = await res.json()
        if (!json.success) {
          throw new Error(json.message || "Couldn't load employees.")
        }
        setEmployees(json.data.data)
        setTotalPages(json.data.totalPages)
        setTotalRecords(json.data.totalRecords)
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          setError(err.message)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchEmployees()
    return () => controller.abort()
  }, [instance, accounts, page, pageSize])

  const filtered = employees.filter((employee) => {
    const term = search.trim().toLowerCase()
    if (!term) return true
    return (
      employee.fullName.toLowerCase().includes(term) ||
      employee.employeeNumber.toLowerCase().includes(term) ||
      employee.email.toLowerCase().includes(term) ||
      (employee.department ?? "").toLowerCase().includes(term)
    )
  })

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal">Employees</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Employee records will appear here.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, ID, email, department"
            className="w-full rounded-md border border-input bg-background py-2 pl-8 pr-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading employees…
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <p className="text-sm font-medium">Couldn&apos;t load employees</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <Users className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">
              {search ? "No employees match your search" : "No employees yet"}
            </p>
            <p className="text-sm text-muted-foreground">
              {search
                ? "Try a different name, ID, email, or department."
                : "Employees you add will show up here."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Employee</th>
                  <th className="px-4 py-3 font-medium">Employee ID</th>
                  <th className="px-4 py-3 font-medium">Department</th>
                  <th className="px-4 py-3 font-medium">Designation</th>
                  <th className="px-4 py-3 font-medium">Date hired</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((employee) => (
                  <tr key={employee.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                          {getInitials(employee.fullName)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{employee.fullName}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {employee.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {employee.employeeNumber}
                    </td>
                    <td className="px-4 py-3">{employee.department ?? "—"}</td>
                    <td className="px-4 py-3">{employee.designation ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(employee.dateHired)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium " +
                          (employee.isActive
                            ? "bg-green-50 text-green-700"
                            : "bg-zinc-100 text-zinc-600")
                        }
                      >
                        {employee.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!isLoading && !error && employees.length > 0 && (
        <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages} · {totalRecords} employee
            {totalRecords === 1 ? "" : "s"}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-md border px-3 py-1.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50 hover:bg-muted/50"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-md border px-3 py-1.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50 hover:bg-muted/50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}