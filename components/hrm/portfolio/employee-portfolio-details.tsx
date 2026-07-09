"use client"

import * as React from "react"
import { Camera, Loader2 } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { request, useAuthorizedHeaders, type components } from "@/lib/api"
import portfolioSections from "@/app/hrm/portfolio/data.json"
import { PortfolioSectionNav } from "@/components/hrm/portfolio/portfolio-section-nav"
import {
  PORTFOLIO_TABLE_RENDERERS,
  type PortfolioSectionId,
} from "@/components/hrm/portfolio/portfolio-table-configs"

function isPortfolioSectionId(id: string): id is PortfolioSectionId {
  return id in PORTFOLIO_TABLE_RENDERERS
}

type ProfileFields = {
  label: string
  value: string | number | null | undefined
}

type EmployeePortfolioDetailsProps = {
  profile: components["schemas"]["EmployeeResponse"]
  onProfileUpdated?: () => void
}

export function EmployeePortfolioDetails({ profile, onProfileUpdated }: EmployeePortfolioDetailsProps) {
  const [activeSectionId, setActiveSectionId] = React.useState(() => {
    if (typeof window === "undefined") return portfolioSections[0].id
    const fromUrl = new URLSearchParams(window.location.search).get("section")
    return fromUrl && portfolioSections.some((section) => section.id === fromUrl)
      ? fromUrl
      : portfolioSections[0].id
  })
  const [headerActionsEl, setHeaderActionsEl] = React.useState<HTMLDivElement | null>(null)
  const [uploadingPicture, setUploadingPicture] = React.useState(false)
  const [pictureError, setPictureError] = React.useState<string | null>(null)
  const pictureInputRef = React.useRef<HTMLInputElement>(null)
  const { headers } = useAuthorizedHeaders()

  const handlePictureChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    setUploadingPicture(true)
    setPictureError(null)
    try {
      const body = new FormData()
      body.append("file", file)

      await request("/api/v1/hrms/me/profile/avatar", headers, {
        method: "POST",
        body,
      })
      onProfileUpdated?.()
    } catch (err) {
      setPictureError(err instanceof Error ? err.message : "Failed to update photo")
    } finally {
      setUploadingPicture(false)
    }
  }
  const activeSection = portfolioSections.find((section) => section.id === activeSectionId) ?? portfolioSections[0]
  const activeTableRenderer = isPortfolioSectionId(activeSectionId)
    ? PORTFOLIO_TABLE_RENDERERS[activeSectionId]
    : undefined

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
            <div className="group relative">
              <Avatar className="size-50">
                <AvatarImage
                  src={`/api/v1/public/avatars/${profile.id}?v=${encodeURIComponent(profile.profilePicture ?? "")}`}
                  alt={profile.fullName}
                />
                <AvatarFallback className="text-6xl font-semibold">
                  {profile.fullName?.charAt(0) ?? "?"}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => pictureInputRef.current?.click()}
                disabled={uploadingPicture}
                aria-label="Change profile photo"
                className="absolute bottom-1 right-1 flex size-10.5 items-center justify-center rounded-full border bg-background text-foreground shadow-xs transition-colors hover:bg-accent disabled:opacity-50"
              >
                {uploadingPicture ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Camera className="size-4" />
                )}
              </button>
              <input
                ref={pictureInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePictureChange}
              />
            </div>
            {pictureError && (
              <p className="text-xs text-destructive">{pictureError}</p>
            )}
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

          <CardContent className="p-0" key={activeSectionId}>
            {activeTableRenderer?.(profile.id, headerActionsEl)}
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
