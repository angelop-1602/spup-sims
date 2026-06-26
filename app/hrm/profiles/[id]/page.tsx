"use client"

import React from "react"
import { useMsal } from "@azure/msal-react"
import { loginRequest } from "@/lib/authConfig"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

interface ProfileValues {
  Id: number
  FirstName: string
  MiddleName: string | null
  LastName: string
  Suffix: string | null
  Gender: string
  BirthDate: string | null
  CivilStatus: string
  PersonalEmail: string
  PhoneNumber: string | null
  MobileNumber: string | null
  Age: number | null
  Religion: string | null
  Address: string | null
  Qualifier: string | null
  ProfilePicture: string | null
  IsActive: boolean
  CreatedAt: string
  UpdatedAt: string | null
  DeletedAt: string | null
  IsDeleted: boolean
}

interface ProfileResponse {
  success: boolean
  message: string
  data: {
    entity: string
    id: number
    values: ProfileValues
  }
}

function formatDate(dateString: string | null) {
  if (!dateString) return "—"
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function DetailRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="grid grid-cols-3 gap-4 py-3 border-b last:border-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="col-span-2 text-sm font-medium">{value || "—"}</dd>
    </div>
  )
}

export default function ProfileDetailPage() {
  const { instance, accounts } = useMsal()
  const params = useParams()
  const id = params?.id as string

  const [profile, setProfile] = React.useState<ProfileValues | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    async function fetchProfile() {
      if (accounts.length === 0 || !id) return

      setIsLoading(true)

      try {
        const tokenResponse = await instance.acquireTokenSilent({
          ...loginRequest,
          account: accounts[0],
        })

        const res = await fetch(`/api/v1/core/profiles/${id}`, {
          headers: {
            Authorization: `Bearer ${tokenResponse.accessToken}`,
            "Content-Type": "application/json",
          },
        })

        if (!res.ok) {
          console.error(`Profile fetch failed with status: ${res.status}`)
          setProfile(null)
          return
        }

        const payload: ProfileResponse = await res.json()

        if (payload && payload.success && payload.data) {
          setProfile(payload.data.values)
        } else {
          setProfile(null)
        }
      } catch (error) {
        console.error("Failed to acquire token or fetch data:", error)
        setProfile(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [instance, accounts, id])

  const fullName = profile
    ? [profile.FirstName, profile.MiddleName, profile.LastName, profile.Suffix]
        .filter(Boolean)
        .join(" ")
    : ""

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/hrm/applicants"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Applicants
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-24 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading profile…
        </div>
      ) : !profile ? (
        <div className="flex flex-col items-center justify-center gap-2 py-24 text-center">
          <p className="text-sm font-medium">Profile not found</p>
          <p className="text-sm text-muted-foreground">
            The profile you&apos;re looking for doesn&apos;t exist or could not be loaded.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-muted text-lg font-semibold">
              {profile.FirstName?.[0]?.toUpperCase()}
              {profile.LastName?.[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-normal">{fullName}</h1>
              <p className="text-sm text-muted-foreground">{profile.PersonalEmail}</p>
            </div>
            <div className="ml-auto">
              <span
                className={
                  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium " +
                  (profile.IsActive
                    ? "bg-green-50 text-green-700"
                    : "bg-zinc-100 text-zinc-600")
                }
              >
                {profile.IsActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>

          {/* Personal Information */}
          <div className="rounded-lg border">
            <div className="border-b px-4 py-3">
              <h2 className="text-sm font-semibold">Personal Information</h2>
            </div>
            <dl className="px-4">
              <DetailRow label="First Name" value={profile.FirstName} />
              <DetailRow label="Middle Name" value={profile.MiddleName} />
              <DetailRow label="Last Name" value={profile.LastName} />
              <DetailRow label="Suffix" value={profile.Suffix} />
              <DetailRow label="Gender" value={profile.Gender} />
              <DetailRow label="Date of Birth" value={formatDate(profile.BirthDate)} />
              <DetailRow label="Age" value={profile.Age != null ? String(profile.Age) : null} />
              <DetailRow label="Civil Status" value={profile.CivilStatus} />
              <DetailRow label="Religion" value={profile.Religion} />
            </dl>
          </div>

          {/* Contact Information */}
          <div className="rounded-lg border">
            <div className="border-b px-4 py-3">
              <h2 className="text-sm font-semibold">Contact Information</h2>
            </div>
            <dl className="px-4">
              <DetailRow label="Personal Email" value={profile.PersonalEmail} />
              <DetailRow label="Phone Number" value={profile.PhoneNumber} />
              <DetailRow label="Mobile Number" value={profile.MobileNumber} />
              <DetailRow label="Address" value={profile.Address} />
            </dl>
          </div>

          {/* Record Details */}
          <div className="rounded-lg border">
            <div className="border-b px-4 py-3">
              <h2 className="text-sm font-semibold">Record Details</h2>
            </div>
            <dl className="px-4">
              <DetailRow label="Profile ID" value={String(profile.Id)} />
              <DetailRow label="Date Created" value={formatDate(profile.CreatedAt)} />
              <DetailRow label="Last Updated" value={formatDate(profile.UpdatedAt)} />
              <DetailRow label="Qualifier" value={profile.Qualifier} />
            </dl>
          </div>
        </div>
      )}
    </div>
  )
}