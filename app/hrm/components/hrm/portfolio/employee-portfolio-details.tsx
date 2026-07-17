"use client"

import * as React from "react"
import { Camera, Edit3, Loader2 } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { request, useAuthorizedHeaders, useApiMutation, type components } from "@/lib/api"
import portfolioSections from "@/app/hrm/portfolio/data.json"
import { PortfolioSectionNav } from "@/components/hrm/portfolio/portfolio-section-nav"
import {
  PORTFOLIO_TABLE_RENDERERS,
  type PortfolioSectionId,
} from "@/components/hrm/portfolio/portfolio-table-configs"

function isPortfolioSectionId(id: string): id is PortfolioSectionId {
  return id in PORTFOLIO_TABLE_RENDERERS
}

// Backend enums serialize as numbers; map to their declared labels.
const GENDER_LABELS: Record<number, string> = {
  0: "Male",
  1: "Female",
}

const CIVIL_STATUS_LABELS: Record<number, string> = {
  0: "Single",
  1: "Married",
  2: "Separated",
  3: "Widowed",
  4: "Divorced",
}

function formatGender(value: number | string | null | undefined) {
  if (value === null || value === undefined) return "—"
  return GENDER_LABELS[Number(value)] ?? String(value)
}

function formatCivilStatus(value: number | string | null | undefined) {
  if (value === null || value === undefined) return "—"
  return CIVIL_STATUS_LABELS[Number(value)] ?? String(value)
}

type ProfileFields = {
  label: string
  value: string | number | null | undefined
}

type EmployeePortfolioDetailsProps = {
  profile: components["schemas"]["EmployeeResponse"]
  onProfileUpdated?: () => void
  /** When true, hides the avatar upload button and edit actions (e.g. when viewing another employee's profile) */
  readOnly?: boolean
}

type EditProfileForm = {
  firstName: string
  middleName: string
  lastName: string
  suffix: string
  gender: string
  civilStatus: string
  mobileNumber: string
  phoneNumber: string
  religion: string
  age: string
}

function toEditForm(profile: components["schemas"]["EmployeeResponse"]): EditProfileForm {
  return {
    firstName: profile.firstName ?? "",
    middleName: (profile as Record<string, unknown>).middleName as string ?? "",
    lastName: profile.lastName ?? "",
    suffix: (profile as Record<string, unknown>).suffix as string ?? "",
    gender: profile.gender != null ? String(profile.gender) : "",
    civilStatus: profile.civilStatus != null ? String(profile.civilStatus) : "",
    mobileNumber: profile.mobileNumber ?? "",
    phoneNumber: profile.phoneNumber ?? "",
    religion: profile.religion ?? "",
    age: profile.age != null ? String(profile.age) : "",
  }
}

export function EmployeePortfolioDetails({ profile, onProfileUpdated, readOnly = false }: EmployeePortfolioDetailsProps) {
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

  // Edit profile dialog state
  const [editOpen, setEditOpen] = React.useState(false)
  const [editForm, setEditForm] = React.useState<EditProfileForm>(() => toEditForm(profile))
  const [editError, setEditError] = React.useState<string | null>(null)
  const { mutate: saveProfile, loading: savingProfile } = useApiMutation()

  const handleEditOpen = (open: boolean) => {
    if (open) {
      setEditForm(toEditForm(profile))
      setEditError(null)
    }
    setEditOpen(open)
  }

  const handleEditSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setEditError(null)

    const ok = await saveProfile({
      path: `/api/v1/hrms/employees/${profile.id}`,
      method: "PUT",
      body: {
        employeeNumber: profile.employeeNumber ?? "",
        profile: {
          firstName: editForm.firstName,
          middleName: editForm.middleName || null,
          lastName: editForm.lastName,
          suffix: editForm.suffix || null,
          gender: editForm.gender ? Number(editForm.gender) : null,
          civilStatus: editForm.civilStatus ? Number(editForm.civilStatus) : null,
          mobileNumber: editForm.mobileNumber || null,
          phoneNumber: editForm.phoneNumber || null,
          religion: editForm.religion || null,
          age: editForm.age ? Number(editForm.age) : null,
        },
      },
    })

    if (!ok) {
      setEditError("Unable to save profile changes.")
      return
    }

    onProfileUpdated?.()
    setEditOpen(false)
  }

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
    { label: "Gender", value: formatGender(profile.gender) },
    { label: "Civil status", value: formatCivilStatus(profile.civilStatus) },
    { label: "Mobile", value: profile.mobileNumber ?? "—" },
    { label: "Phone", value: profile.phoneNumber ?? "—" },
    { label: "Religion", value: profile.religion ?? "—" },
  ]

  const portfolioFields: ProfileFields[] = [
    { label: "Employee number", value: profile.employeeNumber },
    { label: "Employee type", value: profile.employeeType ?? "—" },
    { label: "Department", value: profile.department ?? "—" },
    { label: "Position", value: profile.position ?? "—" },
    { label: "Employment status", value: profile.employmentStatus ?? "—" },
    { label: "Category", value: profile.employmentCategory ?? "—" },
    { label: "Date hired", value: profile.dateHired ?? "—" },
    { label: "Date regularized", value: profile.dateRegularized ?? "—" },
    { label: "Date separated", value: profile.dateSeparated ?? "—" },
    { label: "Active", value: profile.isActive ? "Yes" : "No" },
    { label: "Shared profile", value: profile.shared ? "Yes" : "No" },
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
              {!readOnly && (
                <>
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
                </>
              )}
            </div>
            {pictureError && (
              <p className="text-xs text-destructive">{pictureError}</p>
            )}
            <div>
              <CardTitle className="text-lg">{profile.fullName}</CardTitle>
              <CardDescription className="mt-1">{profile.email}</CardDescription>
            </div>
          </div>

          <div className="divide-y border-t lg:border-t-0">
            <div className="p-6">
              <div className="flex items-center justify-between pb-2">
                <p className="text-sm font-semibold text-foreground">Personal Details</p>
                {!readOnly && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditOpen(true)}
                    aria-label="Edit profile"
                  >
                    <Edit3 className="mr-1.5 h-3.5 w-3.5" />
                    Edit
                  </Button>
                )}
              </div>
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

      {/* Edit profile dialog */}
      {!readOnly && (
        <Dialog open={editOpen} onOpenChange={handleEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit profile</DialogTitle>
              <DialogDescription>Update your personal details.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditSave} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    First name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    value={editForm.firstName}
                    onChange={(e) => setEditForm((f) => ({ ...f, firstName: e.target.value }))}
                    placeholder="Juan"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Middle name</label>
                  <Input
                    value={editForm.middleName}
                    onChange={(e) => setEditForm((f) => ({ ...f, middleName: e.target.value }))}
                    placeholder="Santos"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Last name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    value={editForm.lastName}
                    onChange={(e) => setEditForm((f) => ({ ...f, lastName: e.target.value }))}
                    placeholder="Dela Cruz"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Suffix</label>
                  <Input
                    value={editForm.suffix}
                    onChange={(e) => setEditForm((f) => ({ ...f, suffix: e.target.value }))}
                    placeholder="Jr., Sr., III"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">Gender</label>
                  <Select
                    value={editForm.gender}
                    onValueChange={(value) => setEditForm((f) => ({ ...f, gender: value }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(GENDER_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Civil status</label>
                  <Select
                    value={editForm.civilStatus}
                    onValueChange={(value) => setEditForm((f) => ({ ...f, civilStatus: value }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select civil status" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CIVIL_STATUS_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">Mobile number</label>
                  <Input
                    value={editForm.mobileNumber}
                    onChange={(e) => setEditForm((f) => ({ ...f, mobileNumber: e.target.value }))}
                    placeholder="+63 9XX XXX XXXX"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Phone number</label>
                  <Input
                    value={editForm.phoneNumber}
                    onChange={(e) => setEditForm((f) => ({ ...f, phoneNumber: e.target.value }))}
                    placeholder="(02) XXXX XXXX"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Religion</label>
                  <Input
                    value={editForm.religion}
                    onChange={(e) => setEditForm((f) => ({ ...f, religion: e.target.value }))}
                    placeholder="e.g. Roman Catholic"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Age</label>
                  <Input
                    type="number"
                    min={0}
                    value={editForm.age}
                    onChange={(e) => setEditForm((f) => ({ ...f, age: e.target.value }))}
                    placeholder="e.g. 30"
                  />
                </div>
              </div>
              {editError && (
                <p className="text-sm text-destructive">{editError}</p>
              )}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={savingProfile}>
                  {savingProfile ? "Saving…" : "Save changes"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

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
            {activeTableRenderer?.(profile.id, headerActionsEl, readOnly)}
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
