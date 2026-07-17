"use client"

import type { RefObject } from "react"
import { Camera, Edit3, Loader2, Printer } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { components } from "@/lib/api"

type Employee = components["schemas"]["EmployeeResponse"]

function employeeInitials(profile: Employee) {
  return `${profile.firstName?.[0] ?? ""}${profile.lastName?.[0] ?? ""}` || "?"
}

export function EmployeeProfileHeader({
  profile,
  canEditProfile,
  canUploadPicture,
  uploadingPicture,
  pictureError,
  pictureInputRef,
  onEdit,
  onPrint,
  onPictureChange,
}: {
  profile: Employee
  canEditProfile: boolean
  canUploadPicture: boolean
  uploadingPicture: boolean
  pictureError: string | null
  pictureInputRef: RefObject<HTMLInputElement | null>
  onEdit: () => void
  onPrint: () => void
  onPictureChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}) {
  const metadata = [
    profile.employeeNumber ? `Employee ${profile.employeeNumber}` : null,
    profile.position,
    profile.department,
  ].filter(Boolean)

  const employmentMetadata = [
    profile.employeeType,
    profile.employmentStatus != null
      ? `Status ${String(profile.employmentStatus)}`
      : null,
  ].filter(Boolean)

  return (
    <Card className="shadow-none print:break-inside-avoid">
      <CardContent className="p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="flex items-center gap-4 sm:items-start">
            <div className="relative shrink-0">
              <Avatar className="size-20 sm:size-24">
                <AvatarImage
                  src={`/api/v1/public/avatars/${profile.id}?v=${encodeURIComponent(profile.profilePicture ?? "")}`}
                  alt={`${profile.fullName} profile photo`}
                />
                <AvatarFallback className="text-xl font-semibold sm:text-2xl">
                  {employeeInitials(profile).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {canUploadPicture ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    onClick={() => pictureInputRef.current?.click()}
                    disabled={uploadingPicture}
                    aria-label="Change profile photo"
                    className="absolute -right-1 -bottom-1 rounded-full bg-background print:hidden"
                  >
                    {uploadingPicture ? (
                      <Loader2 aria-hidden="true" className="animate-spin" />
                    ) : (
                      <Camera aria-hidden="true" />
                    )}
                  </Button>
                  <input
                    ref={pictureInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onPictureChange}
                  />
                </>
              ) : null}
            </div>

            <div className="min-w-0 sm:hidden">
              <h1 className="text-xl font-semibold leading-tight">{profile.fullName}</h1>
              <p className="mt-1 break-all text-sm text-muted-foreground">{profile.email}</p>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="hidden sm:block">
              <h1 className="text-xl font-semibold leading-tight">{profile.fullName}</h1>
              <p className="mt-1 break-all text-sm text-muted-foreground">{profile.email}</p>
            </div>

            {metadata.length > 0 ? (
              <p className="mt-3 text-sm text-foreground sm:mt-3">
                {metadata.join(" · ")}
              </p>
            ) : null}

            <div className="mt-2 flex flex-wrap items-center gap-2">
              {employmentMetadata.map((item) => (
                <Badge key={item} variant="outline">
                  {item}
                </Badge>
              ))}
              <Badge variant={profile.isActive ? "default" : "secondary"}>
                {profile.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>

            {pictureError ? (
              <p className="mt-2 text-sm text-destructive print:hidden">{pictureError}</p>
            ) : null}
          </div>

          <div className="flex shrink-0 flex-col-reverse gap-2 print:hidden sm:flex-row">
            <Button type="button" variant="outline" onClick={onPrint}>
              <Printer aria-hidden="true" />
              Print Profile
            </Button>
            {canEditProfile ? (
              <Button type="button" onClick={onEdit}>
                <Edit3 aria-hidden="true" />
                Edit Profile
              </Button>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
