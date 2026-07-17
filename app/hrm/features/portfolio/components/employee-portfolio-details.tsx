"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  request,
  useApiMutation,
  useAuthorizedHeaders,
  type components,
} from "@/lib/api"
import {
  PORTFOLIO_RECORD_SECTIONS,
  PORTFOLIO_SECTION_IDS,
  PORTFOLIO_SECTIONS,
} from "../constants/portfolio-sections"
import { usePortfolioScrollSpy } from "../hooks/use-portfolio-scroll-spy"
import { EmployeeProfileHeader } from "./employee-profile-header"
import { PortfolioSectionNavigation } from "./portfolio-section-navigation"
import { PORTFOLIO_TABLE_RENDERERS } from "./portfolio-table-configs"
import { ProfileDetailsSection } from "./profile-details-section"

type Employee = components["schemas"]["EmployeeResponse"]

const GENDER_OPTIONS = [
  { value: "0", label: "Male" },
  { value: "1", label: "Female" },
] as const

const CIVIL_STATUS_OPTIONS = [
  { value: "0", label: "Single" },
  { value: "1", label: "Married" },
  { value: "2", label: "Separated" },
  { value: "3", label: "Widowed" },
  { value: "4", label: "Divorced" },
] as const

type EmployeePortfolioDetailsProps = {
  profile: Employee
  onProfileUpdated?: () => void | Promise<void>
  readOnly?: boolean
  canEditProfile?: boolean
  canUploadPicture?: boolean
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

function toEditForm(profile: Employee): EditProfileForm {
  return {
    firstName: profile.firstName ?? "",
    middleName: profile.middleName ?? "",
    lastName: profile.lastName ?? "",
    suffix: profile.suffix ?? "",
    gender: profile.gender != null ? String(profile.gender) : "",
    civilStatus:
      profile.civilStatus != null ? String(profile.civilStatus) : "",
    mobileNumber: profile.mobileNumber ?? "",
    phoneNumber: profile.phoneNumber ?? "",
    religion: profile.religion ?? "",
    age: profile.age != null ? String(profile.age) : "",
  }
}

export function EmployeePortfolioDetails({
  profile,
  onProfileUpdated,
  readOnly = false,
  canEditProfile,
  canUploadPicture,
}: EmployeePortfolioDetailsProps) {
  const editProfileAllowed = canEditProfile ?? !readOnly
  const uploadPictureAllowed = canUploadPicture ?? !readOnly
  const formId = React.useId()
  const [uploadingPicture, setUploadingPicture] = React.useState(false)
  const [pictureError, setPictureError] = React.useState<string | null>(null)
  const pictureInputRef = React.useRef<HTMLInputElement>(null)
  const { headers } = useAuthorizedHeaders()
  const [editOpen, setEditOpen] = React.useState(false)
  const [editForm, setEditForm] = React.useState<EditProfileForm>(() =>
    toEditForm(profile),
  )
  const [editError, setEditError] = React.useState<string | null>(null)
  const { mutate: saveProfile, loading: savingProfile } = useApiMutation()
  const { activeSectionId, navigateToSection } = usePortfolioScrollSpy(
    PORTFOLIO_SECTION_IDS,
  )

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
          civilStatus: editForm.civilStatus
            ? Number(editForm.civilStatus)
            : null,
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

    await onProfileUpdated?.()
    setEditOpen(false)
  }

  const handlePictureChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
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
      await onProfileUpdated?.()
    } catch (uploadError) {
      setPictureError(
        uploadError instanceof Error
          ? uploadError.message
          : "Failed to update photo",
      )
    } finally {
      setUploadingPicture(false)
    }
  }

  return (
    <div
      className="space-y-5 print:bg-white print:text-black"
      data-portfolio-print-root
    >
      <EmployeeProfileHeader
        profile={profile}
        canEditProfile={editProfileAllowed}
        canUploadPicture={uploadPictureAllowed}
        uploadingPicture={uploadingPicture}
        pictureError={pictureError}
        pictureInputRef={pictureInputRef}
        onEdit={() => handleEditOpen(true)}
        onPrint={() => window.print()}
        onPictureChange={handlePictureChange}
      />

      <PortfolioSectionNavigation
        sections={PORTFOLIO_SECTIONS}
        activeSectionId={activeSectionId}
        onNavigate={navigateToSection}
      />

      <ProfileDetailsSection profile={profile} />

      {PORTFOLIO_RECORD_SECTIONS.map((section) => (
        <React.Fragment key={section.id}>
          {PORTFOLIO_TABLE_RENDERERS[section.id](profile.id, readOnly)}
        </React.Fragment>
      ))}

      {editProfileAllowed ? (
        <Dialog open={editOpen} onOpenChange={handleEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit profile</DialogTitle>
              <DialogDescription>Update the employee&apos;s personal details.</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleEditSave} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`${formId}-first-name`}>
                    First name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id={`${formId}-first-name`}
                    value={editForm.firstName}
                    onChange={(event) =>
                      setEditForm((form) => ({
                        ...form,
                        firstName: event.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${formId}-middle-name`}>Middle name</Label>
                  <Input
                    id={`${formId}-middle-name`}
                    value={editForm.middleName}
                    onChange={(event) =>
                      setEditForm((form) => ({
                        ...form,
                        middleName: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${formId}-last-name`}>
                    Last name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id={`${formId}-last-name`}
                    value={editForm.lastName}
                    onChange={(event) =>
                      setEditForm((form) => ({
                        ...form,
                        lastName: event.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${formId}-suffix`}>Suffix</Label>
                  <Input
                    id={`${formId}-suffix`}
                    value={editForm.suffix}
                    onChange={(event) =>
                      setEditForm((form) => ({
                        ...form,
                        suffix: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${formId}-gender`}>Gender</Label>
                  <Select
                    value={editForm.gender}
                    onValueChange={(value) =>
                      setEditForm((form) => ({ ...form, gender: value }))
                    }
                  >
                    <SelectTrigger id={`${formId}-gender`} className="w-full">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {GENDER_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${formId}-civil-status`}>Civil status</Label>
                  <Select
                    value={editForm.civilStatus}
                    onValueChange={(value) =>
                      setEditForm((form) => ({ ...form, civilStatus: value }))
                    }
                  >
                    <SelectTrigger
                      id={`${formId}-civil-status`}
                      className="w-full"
                    >
                      <SelectValue placeholder="Select civil status" />
                    </SelectTrigger>
                    <SelectContent>
                      {CIVIL_STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${formId}-mobile-number`}>Mobile number</Label>
                  <Input
                    id={`${formId}-mobile-number`}
                    value={editForm.mobileNumber}
                    onChange={(event) =>
                      setEditForm((form) => ({
                        ...form,
                        mobileNumber: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${formId}-phone-number`}>Phone number</Label>
                  <Input
                    id={`${formId}-phone-number`}
                    value={editForm.phoneNumber}
                    onChange={(event) =>
                      setEditForm((form) => ({
                        ...form,
                        phoneNumber: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${formId}-religion`}>Religion</Label>
                  <Input
                    id={`${formId}-religion`}
                    value={editForm.religion}
                    onChange={(event) =>
                      setEditForm((form) => ({
                        ...form,
                        religion: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${formId}-age`}>Age</Label>
                  <Input
                    id={`${formId}-age`}
                    type="number"
                    min={0}
                    value={editForm.age}
                    onChange={(event) =>
                      setEditForm((form) => ({
                        ...form,
                        age: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              {editError ? (
                <p className="text-sm text-destructive">{editError}</p>
              ) : null}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditOpen(false)}
                  disabled={savingProfile}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={savingProfile}>
                  {savingProfile ? (
                    <Loader2 aria-hidden="true" className="animate-spin" />
                  ) : null}
                  {savingProfile ? "Saving…" : "Save changes"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  )
}
