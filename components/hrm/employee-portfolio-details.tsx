"use client"

import * as React from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import type { components } from "@/src/lib/api/schema"

type ProfileFields = {
  label: string
  value: string | number | null | undefined
}

type EmployeeResponse = components["schemas"]["EmployeeResponse"] & {
  address?: string | null
}

type EmployeePortfolioDetailsProps = {
  profile: EmployeeResponse
}

export function EmployeePortfolioDetails({ profile }: EmployeePortfolioDetailsProps) {
  const primaryFields: ProfileFields[] = [
    { label: "Employee number", value: profile.employeeNumber },
    { label: "Email", value: profile.email },
    { label: "Department", value: profile.department ?? "—" },
    { label: "Designation", value: profile.designation ?? "—" },
    { label: "Address", value: profile.address ?? "—" },
    { label: "Category", value: profile.employmentCategory ?? "—" },
  ]

  const detailFields: ProfileFields[] = [
    { label: "Mobile", value: profile.mobileNumber ?? "—" },
    { label: "Phone", value: profile.phoneNumber ?? "—" },
    { label: "Date hired", value: profile.dateHired ?? "—" },
    { label: "Regularized", value: profile.dateRegularized ?? "—" },
    { label: "Active", value: profile.isActive ? "Yes" : "No" },
  ]

  return (
    <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
      <Card className="rounded-lg border bg-card p-6">
        <CardHeader className="p-0">
          <div className="flex items-center gap-4">
            <div className="inline-flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-muted text-xl font-semibold text-foreground">
              {profile.fullName?.charAt(0) ?? "?"}
            </div>
            <div>
              <CardTitle className="text-lg">{profile.fullName}</CardTitle>
              <CardDescription>{profile.email}</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="grid gap-3 sm:grid-cols-2 pt-6">
          {primaryFields.map((field) => (
            <DetailRow key={field.label} label={field.label} value={field.value} />
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-lg border bg-card p-6">
        <CardHeader className="p-0">
          <CardTitle>Portfolio details</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-3 pt-6">
          {detailFields.map((field) => (
            <DetailRow key={field.label} label={field.label} value={field.value} />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function DetailRow({
  label,
  value,
}: {
  label: string
  value: string | number | null | undefined
}) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value ?? "—"}</p>
    </div>
  )
}
