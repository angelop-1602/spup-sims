"use client"

import React from "react"
import { useMsal } from "@azure/msal-react"
import { loginRequest } from "@/lib/authConfig"
import { Loader2, ArrowLeft, FileText } from "lucide-react"
import Link from "next/link"
import { useParams, useSearchParams } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

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

interface DocumentValues {
  Id: number
  EmployeeApplicantId: number
  DocumentType: string | null
  FileName: string | null
  FileUrl: string | null
  CreatedAt: string
  UpdatedAt: string | null
}

interface ApplicantDocument {
  entity: string
  id: number
  values: DocumentValues
}

interface DocumentsResponse {
  success: boolean
  message: string
  data: {
    data: ApplicantDocument[]
  }
}

const STATUS_STYLES: Record<string, string> = {
  Interview: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",
  Hired: "bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400",
  Rejected: "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400",
  Pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20 dark:text-yellow-400",
  Submitted: "bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400",
}

function formatDate(dateString: string | null) {
  if (!dateString) return "—"
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function Row({
  label,
  value,
}: {
  label: string
  value: string | null | undefined
}) {
  return (
    <div className="grid grid-cols-[1fr_1.5fr] border-b px-5 py-3 text-sm last:border-0 sm:grid-cols-[180px_1fr]">
      <span className="text-muted-foreground">{label}</span>
      <span className="break-words font-medium">{value || "—"}</span>
    </div>
  )
}

function InfoPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl bg-card text-sm shadow-xs ring-1 ring-foreground/10">
      {children}
    </div>
  )
}

export default function ProfileDetailPage() {
  const { instance, accounts } = useMsal()
  const params = useParams()
  const searchParams = useSearchParams()
  const id = params?.id as string
  const applicantStatus = searchParams.get("status")
  const applicantId = searchParams.get("applicantId")

  const [profile, setProfile] = React.useState<ProfileValues | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [documents, setDocuments] = React.useState<ApplicantDocument[]>([])
  const [isLoadingDocs, setIsLoadingDocs] = React.useState(false)

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

        if (payload?.success && payload.data) {
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

  React.useEffect(() => {
    async function fetchDocuments() {
      if (accounts.length === 0 || !applicantId) return

      setIsLoadingDocs(true)

      try {
        const tokenResponse = await instance.acquireTokenSilent({
          ...loginRequest,
          account: accounts[0],
        })

        const res = await fetch(
          `/api/v1/recruitment/employee-applicant-documents?EmployeeApplicantId=${applicantId}`,
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.accessToken}`,
              "Content-Type": "application/json",
            },
          }
        )

        if (!res.ok) {
          console.error(`Documents fetch failed with status: ${res.status}`)
          setDocuments([])
          return
        }

        const payload: DocumentsResponse = await res.json()

        if (payload?.success && payload.data?.data) {
          setDocuments(payload.data.data)
        } else {
          setDocuments([])
        }
      } catch (error) {
        console.error("Failed to fetch documents:", error)
        setDocuments([])
      } finally {
        setIsLoadingDocs(false)
      }
    }

    fetchDocuments()
  }, [instance, accounts, applicantId])

  const fullName = profile
    ? [profile.FirstName, profile.MiddleName, profile.LastName, profile.Suffix]
        .filter(Boolean)
        .join(" ")
    : ""

  const initials = profile
    ? `${profile.FirstName?.[0] ?? ""}${profile.LastName?.[0] ?? ""}`.toUpperCase()
    : ""

  return (
    <div className="space-y-5">
      <Link
        href="/hrm/applicants"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Applicants
      </Link>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-32 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading profile…
        </div>
      ) : !profile ? (
        <div className="flex flex-col items-center justify-center gap-2 py-32 text-center">
          <p className="text-sm font-medium">Profile not found</p>
          <p className="text-sm text-muted-foreground">
            This profile doesn&apos;t exist or could not be loaded.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* ── Profile card ── */}
          <Card>
            <CardContent className="py-3">
              <div className="flex items-center gap-5">
                <Avatar className="size-30 shrink-0">
                  {profile.ProfilePicture && (
                    <AvatarImage src={profile.ProfilePicture} alt={fullName} />
                  )}
                  <AvatarFallback className="bg-gray-700 text-2xl font-semibold text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <h1 className="text-xl font-semibold leading-tight">
                    {fullName}
                  </h1>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {profile.PersonalEmail}
                  </p>
                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                    {applicantStatus && (
                      <Badge
                        variant="outline"
                        className={STATUS_STYLES[applicantStatus] ?? ""}
                      >
                        {applicantStatus}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-xs text-muted-foreground">Profile ID</p>
                  <p className="font-mono text-sm font-semibold">
                    #{profile.Id}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── Tabs ── */}
          <Tabs defaultValue="personal">
            <TabsList className="w-full">
              <TabsTrigger value="personal" className="flex-1">
                Personal
              </TabsTrigger>
              <TabsTrigger value="contact" className="flex-1">
                Contact
              </TabsTrigger>
              <TabsTrigger value="record" className="flex-1">
                Record
              </TabsTrigger>
              <TabsTrigger value="resume" className="flex-1">
                Resume
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="mt-4">
              <InfoPanel>
                <Row label="First Name" value={profile.FirstName} />
                <Row label="Middle Name" value={profile.MiddleName} />
                <Row label="Last Name" value={profile.LastName} />
                {profile.Suffix && (
                  <Row label="Suffix" value={profile.Suffix} />
                )}
                <Row label="Gender" value={profile.Gender} />
                <Row
                  label="Date of Birth"
                  value={formatDate(profile.BirthDate)}
                />
                <Row
                  label="Age"
                  value={
                    profile.Age != null ? `${profile.Age} years old` : null
                  }
                />
                <Row label="Civil Status" value={profile.CivilStatus} />
                <Row label="Religion" value={profile.Religion} />
              </InfoPanel>
            </TabsContent>

            <TabsContent value="contact" className="mt-4">
              <InfoPanel>
                <Row label="Personal Email" value={profile.PersonalEmail} />
                <Row label="Phone Number" value={profile.PhoneNumber} />
                <Row label="Mobile Number" value={profile.MobileNumber} />
                <Row label="Address" value={profile.Address} />
              </InfoPanel>
            </TabsContent>

            <TabsContent value="record" className="mt-4">
              <InfoPanel>
                <Row label="Profile ID" value={String(profile.Id)} />
                <Row label="Date Created" value={formatDate(profile.CreatedAt)} />
                <Row label="Last Updated" value={formatDate(profile.UpdatedAt)} />
                <Row label="Qualifier" value={profile.Qualifier} />
              </InfoPanel>
            </TabsContent>

            <TabsContent value="resume" className="mt-4">
              <InfoPanel>
                {isLoadingDocs ? (
                  <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading documents…
                  </div>
                ) : documents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm font-medium">No documents on file</p>
                    <p className="text-sm text-muted-foreground">
                      Uploaded documents will appear here.
                    </p>
                  </div>
                ) : (
                  documents.map((doc) => {
                    const v = doc.values
                    return (
                      <div
                        key={doc.id}
                        className="flex items-center gap-3 border-b px-5 py-3 text-sm last:border-0"
                      >
                        <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">
                            {v.FileName ?? "Untitled document"}
                          </p>
                          {v.DocumentType && (
                            <p className="text-xs text-muted-foreground">
                              {v.DocumentType}
                            </p>
                          )}
                        </div>
                        {v.FileUrl && (
                          <a
                            href={v.FileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 text-xs font-medium text-primary hover:underline"
                          >
                            View
                          </a>
                        )}
                      </div>
                    )
                  })
                )}
              </InfoPanel>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}
