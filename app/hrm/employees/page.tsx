"use client"

import { useEffect, useState } from "react"
import { Loader2, Search, Users, Eye } from "lucide-react"
import { PermissionGuard } from "@/components/auth/permission-guard"
import {
  useApiQuery,
  useApiClient,
  type components,
} from "@/lib/api"
import { EmployeeDetailsModal } from "./modal"

type Employee = components["schemas"]["EmployeeResponse"]
type PagedEmployees = components["schemas"]["PagedResponseOfEmployeeResponse"]
type PagedDepartments = components["schemas"]["PagedResponseOfDepartmentResponse"]
type PagedDesignations = components["schemas"]["PagedResponseOfDesignationResponse"]

const PAGE_SIZE = 10

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

export default function EmployeesPage() {
  // Search and filters
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("")
  const [designationFilter, setDesignationFilter] = useState("")

  // Pagination
  const [page, setPage] = useState(1)

  // Employee modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [detailedEmployee, setDetailedEmployee] = useState<unknown | null>(null)
  const [isModalLoading, setIsModalLoading] = useState(false)

  const { query } = useApiClient()

  // Search input
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(1)
    }, 200) // 200ms debounce
    return () => clearTimeout(timeout)
  }, [search])

  const {
    data: employeesPaged,
    loading,
    error,
  } = useApiQuery<PagedEmployees>("/api/v1/hrms/employees", {
    page,
    pageSize: PAGE_SIZE,
    search: debouncedSearch || undefined,
    designationId: designationFilter || undefined,
    departmentId: departmentFilter || undefined,
  })

  const { data: departmentsPaged } = useApiQuery<PagedDepartments>(
    "/api/v1/organization/departments",
    { Page: 1, PageSize: 100, SortBy: "name" },
  )

  const { data: designationsPaged } = useApiQuery<PagedDesignations>(
    "/api/v1/organization/designations",
    {
      Page: 1,
      PageSize: 100,
      SortBy: "name",
      departmentId: departmentFilter || undefined,
    },
  )

  const departmentOptions = (departmentsPaged?.data ?? [])
    .filter((item) => item.name)
    .sort((a, b) => a.name.localeCompare(b.name))

  const designationOptions = (designationsPaged?.data ?? [])
    .filter((item) => item.name)
    .sort((a, b) => a.name.localeCompare(b.name))

  async function handleViewDetails(id: number) {
    setIsModalOpen(true)
    setIsModalLoading(true)
    setDetailedEmployee(null)

    try {
      const employee = await query<Employee>(
        `/api/v1/hrms/employees/${id}`,
      )
      setDetailedEmployee(employee)
    } catch (err) {
      console.error("Error fetching detailed employee data:", err)
    } finally {
      setIsModalLoading(false)
    }
  }

  const employees = employeesPaged?.data ?? []
  const totalPages = Number(employeesPaged?.totalPages ?? 1)
  const totalRecords = employeesPaged?.totalRecords ?? 0

  const hasActiveFilters = Boolean(search || departmentFilter || designationFilter)

  return (
    <PermissionGuard requiredPermission="hrms.employees.view">
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal">Employees</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Employee details will appear below.
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employees by name"
            className="w-full rounded-md border border-input bg-background py-2 pl-8 pr-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>

        <select
          value={departmentFilter}
          onChange={(e) => {
            setDepartmentFilter(e.target.value)
            setDesignationFilter("")
            setPage(1)
          }}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:w-48"
        >
          <option value="">All departments</option>
          {departmentOptions.map((dept) => (
            <option key={String(dept.id)} value={String(dept.id)}>
              {dept.name}
            </option>
          ))}
        </select>

        <select
          value={designationFilter}
          onChange={(e) => {
            setDesignationFilter(e.target.value)
            setPage(1)
          }}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:w-48"
        >
          <option value="">All designations</option>
          {designationOptions.map((role) => (
            <option key={String(role.id)} value={String(role.id)}>
              {role.name}
            </option>
          ))}
        </select>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => {
              setSearch("")
              setDepartmentFilter("")
              setDesignationFilter("")
              setPage(1)
            }}
            className="text-sm font-medium text-muted-foreground underline-offset-2 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading employees…
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <p className="text-sm font-medium">Couldn&apos;t load employees</p>
            <p className="text-sm text-muted-foreground">{error.message}</p>
          </div>
        ) : employees.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <Users className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">
              {hasActiveFilters ? "No employees match your filters" : "No employees yet"}
            </p>
            <p className="text-sm text-muted-foreground">
              {hasActiveFilters
                ? "Try a different name."
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
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
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
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleViewDetails(employee.id as number)}
                        title="View Details"
                        className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <EmployeeDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isLoading={isModalLoading}
        employee={detailedEmployee}
        getInitials={getInitials}
      />

      {!loading && !error && employees.length > 0 && (
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
    </PermissionGuard>
  )
}
