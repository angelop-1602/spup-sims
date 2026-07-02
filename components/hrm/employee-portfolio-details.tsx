"use client"

import * as React from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { components } from "@/lib/api"
import portfolioSections from "@/app/hrm/portfolio/data.json"
import { PortfolioSectionNav } from "@/components/hrm/portfolio-section-nav"

type ProfileFields = {
  label: string
  value: string | number | null | undefined
}

type EmployeePortfolioDetailsProps = {
  profile: components["schemas"]["EmployeeResponse"]
}

export function EmployeePortfolioDetails({ profile }: EmployeePortfolioDetailsProps) {
  const [activeSectionId, setActiveSectionId] = React.useState(portfolioSections[0].id)
  const activeSection = portfolioSections.find((section) => section.id === activeSectionId) ?? portfolioSections[0]
  const personalFields: ProfileFields[] = [
    { label: "Age", value: profile.age ?? "—" },
    { label: "Mobile", value: profile.mobileNumber ?? "—" },
    { label: "Phone", value: profile.phoneNumber ?? "—" },
    { label: "Religion", value: profile.religion ?? "—" },
  ]

  const portfolioFields: ProfileFields[] = [
    { label: "Employee number", value: profile.employeeNumber },
    { label: "Employee type", value: profile.employeeType ?? "—" },
    { label: "Department", value: profile.department ?? "—" },
    { label: "Designation", value: profile.designation ?? "—" },
    { label: "Supervisor", value: profile.supervisor ?? "—" },
    { label: "Category", value: profile.employmentCategory ?? "—" },
    { label: "Date hired", value: profile.dateHired ?? "—" },
    { label: "Regularized", value: profile.dateRegularized ?? "—" },
    { label: "Active", value: profile.isActive ? "Yes" : "No" },
  ]

  return (
    <div className="flex flex-col gap-4">
      <Card className="gap-0 py-0 rounded-lg">
        <CardContent className="flex items-center gap-4 py-6">
          <Avatar className="size-16">
            <AvatarFallback className="text-xl font-semibold">
              {profile.fullName?.charAt(0) ?? "?"}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg">{profile.fullName}</CardTitle>
            {profile.designation && (
              <Badge
                variant="outline"
                className="mt-1 border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400"
              >
                {profile.designation}
              </Badge>
            )}
            <CardDescription className="mt-1">{profile.email}</CardDescription>
          </div>
        </CardContent>

        <div className="grid border-t p-0 lg:grid-cols-2 lg:divide-x">
          <div className="p-6">
            <p className="pb-2 text-sm font-semibold text-foreground">
              Personal Details
            </p>
            <div className="grid grid-cols-2 gap-2">
              {personalFields.map((field) => (
                <DetailRow key={field.label} label={field.label} value={field.value} />
              ))}
            </div>
          </div>

          <div className="border-t p-6 lg:border-t-0">
            <p className="pb-2 text-sm font-semibold text-foreground">
              Portfolio Details
            </p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {portfolioFields.map((field) => (
                <DetailRow key={field.label} label={field.label} value={field.value} />
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[20rem_1fr]">
        <PortfolioSectionNav
          sections={portfolioSections}
          activeSectionId={activeSectionId}
          onSelect={setActiveSectionId}
        />

        <Card className="gap-0 overflow-hidden rounded-lg">
          <CardHeader className="border-b">
            <CardTitle className="text-base font-medium">{activeSection.label}</CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    {activeSection.columns.map((column) => (
                      <th key={column} className="px-4 py-3 font-medium">
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activeSection.rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={activeSection.columns.length}
                        className="px-4 py-6 text-center text-muted-foreground"
                      >
                        No results.
                      </td>
                    </tr>
                  ) : (
                    activeSection.rows.map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-b last:border-0 hover:bg-muted/30">
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} className="px-4 py-3">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
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
      <p className="font-medium">{value ?? "—"}</p>
    </div>
  )
}
