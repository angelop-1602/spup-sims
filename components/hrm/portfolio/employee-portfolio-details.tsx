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
import { PortfolioSectionNav } from "@/components/hrm/portfolio/portfolio-section-nav"
import { EducationalBackgroundTable } from "@/components/hrm/portfolio/educational-background-table"
import { WorkExperienceTable } from "@/components/hrm/portfolio/work-experience-table"
import { NationalCertificationTable } from "@/components/hrm/portfolio/national-certification-table"
import { OrganizationAffiliationTable } from "@/components/hrm/portfolio/organization-affiliation-table"
import { ProfessionalEngagementTable } from "@/components/hrm/portfolio/professional-engagement-table"
import { ResearchEngagementTable } from "@/components/hrm/portfolio/research-engagement-table"
import { CommunityInvolvementTable } from "@/components/hrm/portfolio/community-involvement-table"
import { AwardRecognitionTable } from "@/components/hrm/portfolio/award-recognition-table"

const SECTION_TABLES: Record<
  string,
  React.ComponentType<{ profileId: number | string; headerActionsEl: HTMLElement | null }>
> = {
  "educational-background": EducationalBackgroundTable,
  "work-experience": WorkExperienceTable,
  "national-certification": NationalCertificationTable,
  "organization-affiliation": OrganizationAffiliationTable,
  "professional-engagement": ProfessionalEngagementTable,
  "research-creative-work": ResearchEngagementTable,
  "community-parish-involvement": CommunityInvolvementTable,
  "awards-recognition": AwardRecognitionTable,
}

type ProfileFields = {
  label: string
  value: string | number | null | undefined
}

type EmployeePortfolioDetailsProps = {
  profile: components["schemas"]["EmployeeResponse"]
}

export function EmployeePortfolioDetails({ profile }: EmployeePortfolioDetailsProps) {
  const [activeSectionId, setActiveSectionId] = React.useState(portfolioSections[0].id)
  const [headerActionsEl, setHeaderActionsEl] = React.useState<HTMLDivElement | null>(null)
  const activeSection = portfolioSections.find((section) => section.id === activeSectionId) ?? portfolioSections[0]
  const ActiveSectionTable = SECTION_TABLES[activeSectionId]

  React.useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("section")
    if (fromUrl && portfolioSections.some((section) => section.id === fromUrl)) {
      setActiveSectionId(fromUrl)
    }
  }, [])

  const handleSelectSection = (id: string) => {
    setActiveSectionId(id)
    const url = new URL(window.location.href)
    url.searchParams.set("section", id)
    window.history.replaceState(null, "", url)
  }
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
      <Card className="gap-0 overflow-hidden rounded-lg py-0">
        <div className="grid lg:grid-cols-[20rem_1fr] lg:divide-x">
          <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
            <Avatar className="size-40">
              <AvatarFallback className="text-6xl font-semibold">
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
          </div>

          <div className="divide-y border-t lg:border-t-0">
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

            <div className="p-6">
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
        </div>
      </Card>

      <div className="grid items-start gap-4 lg:grid-cols-[20rem_1fr]">
        <PortfolioSectionNav
          sections={portfolioSections}
          activeSectionId={activeSectionId}
          onSelect={handleSelectSection}
        />

        <Card className="gap-0 overflow-hidden rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between border-b">
            <CardTitle className="text-base font-medium">{activeSection.label}</CardTitle>
            <div ref={setHeaderActionsEl} />
          </CardHeader>

          <CardContent className="p-0">
            {ActiveSectionTable && (
              <ActiveSectionTable profileId={profile.id} headerActionsEl={headerActionsEl} />
            )}
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
