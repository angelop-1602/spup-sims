"use client"

import { useEffect, useState } from "react"
import { useMsal } from "@azure/msal-react"
import { loginRequest } from "@/lib/authConfig"
import { Loader2, Search, Users, Eye } from "lucide-react"
import { Employee, EmployeesResponse, Department, DepartmentsResponse, Designation, DesignationsResponse } from "./types"
import { EmployeeDetailsModal } from "./modal"

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
  const { instance, accounts } = useMsal()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Search and filters
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("")
  const [designationFilter, setDesignationFilter] = useState("")

  // Structured details for options
  const [departmentOptions, setDepartmentOptions] = useState<{ id: string; name: string }[]>([])
  const [designationOptions, setDesignationOptions] = useState<{ id: string; name: string }[]>([])

  // Pagination
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)

  // Employee modal
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [detailedEmployee, setDetailedEmployee] = useState<any | null>(null)
  const [isModalLoading, setIsModalLoading] = useState(false)

  // Search input
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(1)
    }, 200) // 200ms debounce
    return () => clearTimeout(timeout)
  }, [search])

  useEffect(() => {
    setDesignationFilter("")
  }, [departmentFilter])

  async function handleViewDetails(id: number) {
    setSelectedEmployeeId(id)
    setIsModalOpen(true)
    setIsModalLoading(true)
    setDetailedEmployee(null) 

    try {
      const tokenResponse = await instance.acquireTokenSilent({
        ...loginRequest,
        account: accounts[0],
      })

      const res = await fetch(`/api/v1/hrms/employees/${id}`, {
        headers: {
          Authorization: `Bearer ${tokenResponse.accessToken}`,
          "Content-Type": "application/json",
        },
      })

      if (!res.ok) throw new Error("Could not load employee details profile.")
      const json = await res.json()
      
      if (json.success) {
        setDetailedEmployee(json.data)
      }
    } catch (err) {
      console.error("Error fetching detailed employee data:", err)
    } finally {
      setIsModalLoading(false)
    }
  }

  // Reset pagination when filters are adjusted
  useEffect(() => {
    setPage(1)
  }, [departmentFilter, designationFilter])

  // Fetch dropdown options for departments
  useEffect(() => {
    if (accounts.length === 0) return
    const controller = new AbortController()

    async function fetchDepartments() {
      try {
        const tokenResponse = await instance.acquireTokenSilent({
          ...loginRequest,
          account: accounts[0],
        })

        const res = await fetch("/api/v1/organization/departments", {
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${tokenResponse.accessToken}`,
            "Content-Type": "application/json",
          },
        })
        
        if (!res.ok) throw new Error("Failed to fetch departments")
        
        const json: DepartmentsResponse = await res.json()
        
        if (json.success && json.data?.data) {
          const depts = json.data.data
          .map((item: Department) => ({
            id: String(item.id),
            name: item.name || ""
          }))
          .filter((item: { id: string; name: string }) => item.name)
          .sort((a: { id: string; name: string }, b: { id: string; name: string }) => 
            a.name.localeCompare(b.name)
          )
            
          setDepartmentOptions(depts)
        }
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          console.error("Departments dropdown query failed:", err.message)
        }
      }
    }

    fetchDepartments()
    return () => controller.abort()
  }, [instance, accounts])
  
  // Fetch dropdown options for designations dynamically
  useEffect(() => {
    if (accounts.length === 0) return
    const controller = new AbortController()

    async function fetchDesignations() {
      try {
        const tokenResponse = await instance.acquireTokenSilent({
          ...loginRequest,
          account: accounts[0],
        })

        const params = new URLSearchParams()
        if (departmentFilter) {
          params.set("departmentId", departmentFilter)
        }

        const res = await fetch(`/api/v1/organization/designations?${params.toString()}`, {
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${tokenResponse.accessToken}`,
            "Content-Type": "application/json",
          },
        })

        if (!res.ok) throw new Error("Failed to fetch designations")

        const json: DesignationsResponse = await res.json()
        
        if (json.success && json.data?.data) {
          const structuralRoles = json.data.data
            .map((item: Designation) => ({
              id: String(item.id),            
              name: item.name || ""
            }))
            .filter((item: { id: string; name: string }) => item.name)
            .sort((a: { id: string; name: string }, b: { id: string; name: string }) => a.name.localeCompare(b.name))
            
          setDesignationOptions(structuralRoles)
        }
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          console.error("Designations dropdown query failed:", err.message)
        }
      }
    }

    fetchDesignations()
    return () => controller.abort()
  }, [instance, accounts, departmentFilter])

  // Fetch employees based on current filters
  useEffect(() => {
    if (accounts.length === 0) return
    const controller = new AbortController()

    async function fetchEmployees() {
      setIsLoading(true)
      setError(null)
      try {
        const tokenResponse = await instance.acquireTokenSilent({
          ...loginRequest,
          account: accounts[0],
        })

        const params = new URLSearchParams({
          page: String(page),
          pageSize: String(PAGE_SIZE),
        })
        
        if (debouncedSearch) params.set("search", debouncedSearch)
        if (designationFilter) params.set("designationId", designationFilter)
        if (departmentFilter) {
          params.set("departmentId", departmentFilter)
        }

        const res = await fetch(`/api/v1/hrms/employees?${params.toString()}`, {
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${tokenResponse.accessToken}`,
            "Content-Type": "application/json",
          },
        })
        
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
  }, [
    instance,
    accounts,
    page,
    debouncedSearch,
    departmentFilter,
    designationFilter,
  ])

  const hasActiveFilters = Boolean(search || departmentFilter || designationFilter)

  return (
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
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:w-48"
        >
          <option value="">All departments</option>
          {departmentOptions.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </select>

        <select
          value={designationFilter}
          onChange={(e) => setDesignationFilter(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:w-48"
        >
          <option value="">All designations</option>
          {designationOptions.map((role) => (
            <option key={role.id} value={role.id}>
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
            }}
            className="text-sm font-medium text-muted-foreground underline-offset-2 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border">
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
                        onClick={() => handleViewDetails(employee.id)}
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