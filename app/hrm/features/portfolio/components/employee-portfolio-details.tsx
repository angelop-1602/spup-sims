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
  useApiQuery,
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

// Values are the backend enum member names (SIS.Domain.Platform.Gender) — the API
// serializes enums as strings, so these must match exactly, not the enum's ordinal.
const GENDER_OPTIONS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" },
] as const

// Values are the backend enum member names (SIS.Domain.Platform.CivilStatus).
const CIVIL_STATUS_OPTIONS = [
  { value: "Single", label: "Single" },
  { value: "Married", label: "Married" },
  { value: "Widowed", label: "Widowed" },
  { value: "Separated", label: "Separated" },
] as const

type EmployeePortfolioDetailsProps = {
  profile: Employee
  onProfileUpdated?: () => void | Promise<void>
  readOnly?: boolean
  canEditProfile?: boolean
  canUploadPicture?: boolean
  /** Whether this is the viewer's own portfolio — determines which endpoint the edit
   * dialog saves to (self-service `/me/profile` vs. HR-managed `/employees/{id}`).
   * Defaults to true, matching the "my portfolio" page's usage. */
  selfService?: boolean
  /** Whether the viewer can edit employment details (department, position, employee
   * type, date hired) from this page. Defaults to false — only HR roles with
   * hrms.employees.update should see this. */
  canEditEmployment?: boolean
}

type EditEmploymentForm = {
  employeeNumber: string
  departmentId: string
  positionId: string
  employeeTypeId: string
  dateHired: string
}

function toEditEmploymentForm(profile: Employee): EditEmploymentForm {
  return {
    employeeNumber: profile.employeeNumber ?? "",
    departmentId: profile.departmentId ? String(profile.departmentId) : "",
    positionId: profile.positionId ? String(profile.positionId) : "",
    employeeTypeId: profile.employeeTypeId ? String(profile.employeeTypeId) : "",
    dateHired: profile.dateHired ?? "",
  }
}

type EditProfileForm = {
  firstName: string
  middleName: string
  lastName: string
  suffix: string
  gender: string
  civilStatus: string
  personalEmail: string
  mobileNumber: string
  phoneNumber: string
  religion: string
  birthDate: string
  age: string
}

/** Age is derived from birth date rather than entered directly. */
function calculateAge(birthDate: string): string {
  const dob = new Date(birthDate)
  if (!birthDate || Number.isNaN(dob.getTime())) return ""
  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()
  const monthDiff = today.getMonth() - dob.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age -= 1
  }
  return age >= 0 ? String(age) : ""
}

function toEditForm(profile: Employee): EditProfileForm {
  const birthDate = profile.birthDate ?? ""
  return {
    firstName: profile.firstName ?? "",
    middleName: profile.middleName ?? "",
    lastName: profile.lastName ?? "",
    suffix: profile.suffix ?? "",
    gender: profile.gender != null ? String(profile.gender) : "",
    civilStatus:
      profile.civilStatus != null ? String(profile.civilStatus) : "",
    personalEmail: profile.email ?? "",
    mobileNumber: profile.mobileNumber ?? "",
    phoneNumber: profile.phoneNumber ?? "",
    religion: profile.religion ?? "",
    birthDate,
    age: birthDate
      ? calculateAge(birthDate)
      : profile.age != null
        ? String(profile.age)
        : "",
  }
}

export function EmployeePortfolioDetails({
  profile,
  onProfileUpdated,
  readOnly = false,
  canEditProfile,
  canUploadPicture,
  selfService = true,
  canEditEmployment = false,
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

  const [editEmploymentOpen, setEditEmploymentOpen] = React.useState(false)
  const [editEmploymentForm, setEditEmploymentForm] =
    React.useState<EditEmploymentForm>(() => toEditEmploymentForm(profile))
  const [editEmploymentError, setEditEmploymentError] = React.useState<
    string | null
  >(null)
  const { mutate: saveEmployment, loading: savingEmployment } =
    useApiMutation()
  const { data: departmentsData } = useApiQuery<
    components["schemas"]["PagedResponseOfDepartmentResponse"]
  >(
    canEditEmployment ? "/api/v1/organization/departments" : null,
    { Page: 1, PageSize: 500, SortBy: "id" },
  )
  const { data: positionsData } = useApiQuery<
    components["schemas"]["PagedResponseOfPositionResponse"]
  >(canEditEmployment ? "/api/v1/organization/positions" : null, {
    Page: 1,
    PageSize: 500,
    SortBy: "id",
  })
  const { data: employeeTypesData } = useApiQuery<
    components["schemas"]["PagedResponseOfEmployeeTypeResponse"]
  >(canEditEmployment ? "/api/v1/hrms/employee-types" : null, {
    Page: 1,
    PageSize: 500,
    SortBy: "id",
  })
  const departments = departmentsData?.data ?? []
  const positions = positionsData?.data ?? []
  const employeeTypes = employeeTypesData?.data ?? []

  const handleEditEmploymentOpen = (open: boolean) => {
    if (open) {
      setEditEmploymentForm(toEditEmploymentForm(profile))
      setEditEmploymentError(null)
    }
    setEditEmploymentOpen(open)
  }

  const handleEditEmploymentSave = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()
    setEditEmploymentError(null)

    const ok = await saveEmployment({
      path: `/api/v1/hrms/employees/${profile.id}`,
      method: "PUT",
      body: {
        employeeNumber: editEmploymentForm.employeeNumber,
        // Carries the employee's current profile values through unchanged — if the
        // caller also happens to hold core.profiles.update, the backend applies these
        // as a full profile write, so omitting a field here would null it out.
        profile: {
          firstName: profile.firstName,
          middleName: profile.middleName,
          lastName: profile.lastName,
          suffix: profile.suffix,
          gender: profile.gender,
          civilStatus: profile.civilStatus,
          personalEmail: profile.email,
          mobileNumber: profile.mobileNumber,
          phoneNumber: profile.phoneNumber,
          birthDate: profile.birthDate,
          age: profile.age,
          religion: profile.religion,
          qualifier: profile.qualifier,
          profilePicture: profile.profilePicture,
        },
        departmentId: Number(editEmploymentForm.departmentId),
        positionId: Number(editEmploymentForm.positionId),
        employeeTypeId: Number(editEmploymentForm.employeeTypeId),
        dateHired: editEmploymentForm.dateHired,
        employmentStatus: profile.employmentStatus,
        employmentCategory: profile.employmentCategory,
        shared: profile.shared ?? false,
        dateRegularized: profile.dateRegularized ?? null,
        dateSeparated: profile.dateSeparated ?? null,
        isActive: profile.isActive ?? true,
      },
    })

    if (!ok) {
      setEditEmploymentError("Unable to save employment changes.")
      return
    }

    await onProfileUpdated?.()
    setEditEmploymentOpen(false)
  }

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

    const profileFields = {
      firstName: editForm.firstName,
      middleName: editForm.middleName || null,
      lastName: editForm.lastName,
      suffix: editForm.suffix || null,
      // Sent as the backend enum member name (e.g. "Female"), matching how the API
      // itself serializes these fields — not their numeric ordinal.
      gender: editForm.gender || null,
      civilStatus: editForm.civilStatus || null,
      personalEmail: editForm.personalEmail || null,
      mobileNumber: editForm.mobileNumber || null,
      phoneNumber: editForm.phoneNumber || null,
      religion: editForm.religion || null,
      birthDate: editForm.birthDate || null,
      age: editForm.age ? Number(editForm.age) : null,
    }

    const ok = selfService
      ? await saveProfile({
          path: "/api/v1/hrms/me/profile",
          method: "PUT",
          body: profileFields,
        })
      : await saveProfile({
          path: `/api/v1/hrms/employees/${profile.id}`,
          method: "PUT",
          body: {
            employeeNumber: profile.employeeNumber ?? "",
            profile: profileFields,
            // UpdateEmployeeRequest requires these even though this dialog only edits
            // personal details — carry the employee's current values through unchanged
            // so the backend's employment fields aren't reset to their defaults.
            departmentId: profile.departmentId,
            positionId: profile.positionId,
            employeeTypeId: profile.employeeTypeId,
            dateHired: profile.dateHired,
            employmentStatus: profile.employmentStatus,
            employmentCategory: profile.employmentCategory,
            shared: profile.shared ?? false,
            dateRegularized: profile.dateRegularized ?? null,
            dateSeparated: profile.dateSeparated ?? null,
            isActive: profile.isActive ?? true,
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

      <ProfileDetailsSection
        profile={profile}
        canEditEmployment={canEditEmployment}
        onEditEmployment={() => handleEditEmploymentOpen(true)}
      />

      {PORTFOLIO_RECORD_SECTIONS.map((section) => (
        <React.Fragment key={section.id}>
          {PORTFOLIO_TABLE_RENDERERS[section.id](profile.profileId, readOnly)}
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
                  <Label htmlFor={`${formId}-personal-email`}>Personal email</Label>
                  <Input
                    id={`${formId}-personal-email`}
                    type="email"
                    value={editForm.personalEmail}
                    onChange={(event) =>
                      setEditForm((form) => ({
                        ...form,
                        personalEmail: event.target.value,
                      }))
                    }
                  />
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
                  <Label htmlFor={`${formId}-birth-date`}>Birth date</Label>
                  <Input
                    id={`${formId}-birth-date`}
                    type="date"
                    value={editForm.birthDate}
                    onChange={(event) =>
                      setEditForm((form) => ({
                        ...form,
                        birthDate: event.target.value,
                        age: calculateAge(event.target.value),
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
                    readOnly
                    disabled
                    placeholder="Calculated from birth date"
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

      {canEditEmployment ? (
        <Dialog open={editEmploymentOpen} onOpenChange={handleEditEmploymentOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit employment details</DialogTitle>
              <DialogDescription>
                Update the employee&apos;s department, position, type, and hire date.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleEditEmploymentSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`${formId}-employee-number`}>Employee number</Label>
                <Input
                  id={`${formId}-employee-number`}
                  value={editEmploymentForm.employeeNumber}
                  onChange={(event) =>
                    setEditEmploymentForm((form) => ({
                      ...form,
                      employeeNumber: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`${formId}-department`}>
                    Department <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={editEmploymentForm.departmentId}
                    onValueChange={(value) =>
                      setEditEmploymentForm((form) => ({ ...form, departmentId: value }))
                    }
                  >
                    <SelectTrigger id={`${formId}-department`} className="w-full">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={String(dept.id)} value={String(dept.id)}>
                          {dept.name ?? ""} ({dept.code ?? ""})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${formId}-position`}>
                    Position <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={editEmploymentForm.positionId}
                    onValueChange={(value) =>
                      setEditEmploymentForm((form) => ({ ...form, positionId: value }))
                    }
                  >
                    <SelectTrigger id={`${formId}-position`} className="w-full">
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      {positions.map((pos) => (
                        <SelectItem key={String(pos.id)} value={String(pos.id)}>
                          {pos.name ?? ""} ({pos.code ?? ""})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`${formId}-employee-type`}>
                    Employee type <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={editEmploymentForm.employeeTypeId}
                    onValueChange={(value) =>
                      setEditEmploymentForm((form) => ({ ...form, employeeTypeId: value }))
                    }
                  >
                    <SelectTrigger id={`${formId}-employee-type`} className="w-full">
                      <SelectValue placeholder="Select employee type" />
                    </SelectTrigger>
                    <SelectContent>
                      {employeeTypes.map((type) => (
                        <SelectItem key={String(type.id)} value={String(type.id)}>
                          {type.name ?? ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${formId}-date-hired`}>
                    Date hired <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id={`${formId}-date-hired`}
                    type="date"
                    value={editEmploymentForm.dateHired}
                    onChange={(event) =>
                      setEditEmploymentForm((form) => ({
                        ...form,
                        dateHired: event.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </div>

              {editEmploymentError ? (
                <p className="text-sm text-destructive">{editEmploymentError}</p>
              ) : null}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditEmploymentOpen(false)}
                  disabled={savingEmployment}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={savingEmployment}>
                  {savingEmployment ? (
                    <Loader2 aria-hidden="true" className="animate-spin" />
                  ) : null}
                  {savingEmployment ? "Saving…" : "Save changes"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  )
}
