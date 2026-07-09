"use client"

import React from "react"
import { Loader2, ArrowLeft, FileText } from "lucide-react"
import { useApiClient, type components } from "@/lib/api"
import Link from "next/link"
import { useParams, useSearchParams } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

// ─── Interfaces ────────────────────────────────────────────────

interface ProfileValues {
  id: number | string
  firstName: string
  middleName: string | null
  lastName: string
  suffix: string | null
  birthDate: string | null
  personalEmail: string
  phoneNumber: string | null
  mobileNumber: string | null
  age: number | null
  religion: string | null
  address: string | null
  qualifier: string | null
  profilePicture: string | null
  createdAt: string
}

interface ApplicantDocument {
  id: number | string
  requirementName: string | null
  storagePath: string | null
}

interface StatusHistoryEntry {
  id: number | string
  status: string
  remarks: string | null
  createdAt: string
}

interface InterviewSchedule {
  id: number | string
  scheduledAt: string
  venue: string | null
  notes: string | null
  createdAt: string
}

type PagedRecords<TRecord> = Omit<
  components["schemas"]["PagedResponseOfAcademicTermResponse"],
  "data"
> & {
  data: TRecord[]
}

type ProfileRecord = ProfileValues
type ApplicantDocuments = PagedRecords<ApplicantDocument>
type ApplicantStatusHistory = PagedRecords<StatusHistoryEntry>
type ApplicantInterviews = PagedRecords<InterviewSchedule>

// ─── Constants ─────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  Interview: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",
  Hired:     "bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400",
  Rejected:  "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400",
  Pending:   "bg-yellow-500/10 text-yellow-600 border-yellow-500/20 dark:text-yellow-400",
  Submitted: "bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400",
}

const STATUS_DOT: Record<string, string> = {
  Interview: "bg-blue-500",
  Hired:     "bg-green-500",
  Rejected:  "bg-red-500",
  Pending:   "bg-yellow-500",
  Submitted: "bg-purple-500",
}

// ─── Helpers ───────────────────────────────────────────────────

function formatDate(dateString: string | null) {
  if (!dateString) return "—"
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function formatDateTime(dateString: string | null) {
  if (!dateString) return "—"
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

// ─── Sub-components ────────────────────────────────────────────

function InfoPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl bg-card text-sm shadow-xs ring-1 ring-foreground/10">
      {children}
    </div>
  )
}

function PanelHeader({ label }: { label: string }) {
  return (
    <div className="border-b px-5 py-3">
      <p className="text-sm font-medium">{label}</p>
    </div>
  )
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="border-y bg-muted/40 px-5 py-2">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="grid grid-cols-[1fr_1.5fr] border-b px-5 py-3 text-sm last:border-0 sm:grid-cols-[160px_1fr]">
      <span className="text-muted-foreground">{label}</span>
      <span className="break-words font-medium">{value || "—"}</span>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────

export default function ProfileDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const id = params?.id as string
  const applicantStatus = searchParams.get("status")
  const applicantId = searchParams.get("applicantId")

  const [profile, setProfile] = React.useState<ProfileValues | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [documents, setDocuments] = React.useState<ApplicantDocument[]>([])
  const [statusHistory, setStatusHistory] = React.useState<StatusHistoryEntry[]>([])
  const [interviews, setInterviews] = React.useState<InterviewSchedule[]>([])

  const { query, account } = useApiClient()

  React.useEffect(() => {
    if (!account || !id) return

    async function fetchAll() {
      setIsLoading(true)
      try {
        const profileRequest = query<ProfileRecord>(`/api/v1/core/profiles/${id}`)
        const documentsRequest = applicantId
          ? query<ApplicantDocuments>(
              "/api/v1/recruitment/employee-applicant-documents",
              { EmployeeApplicantId: applicantId },
            )
          : Promise.resolve(null)
        const historyRequest = applicantId
          ? query<ApplicantStatusHistory>(
              "/api/v1/recruitment/employee-applicant-status-history",
              { EmployeeApplicantId: applicantId },
            )
          : Promise.resolve(null)
        const interviewsRequest = applicantId
          ? query<ApplicantInterviews>(
              "/api/v1/recruitment/interview-schedules",
              { EmployeeApplicantId: applicantId },
            )
          : Promise.resolve(null)

        const [
          profileResult,
          documentsResult,
          historyResult,
          interviewsResult,
        ] = await Promise.allSettled([
          profileRequest,
          documentsRequest,
          historyRequest,
          interviewsRequest,
        ])

        setProfile(profileResult.status === "fulfilled" ? profileResult.value : null)
        setDocuments(documentsResult.status === "fulfilled" ? documentsResult.value?.data ?? [] : [])
        setStatusHistory(historyResult.status === "fulfilled" ? historyResult.value?.data ?? [] : [])
        setInterviews(interviewsResult.status === "fulfilled" ? interviewsResult.value?.data ?? [] : [])
      } catch {
        setProfile(null)
        setDocuments([])
        setStatusHistory([])
        setInterviews([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchAll()
  }, [query, account, id, applicantId])

  const fullName = profile
    ? [profile.firstName, profile.middleName, profile.lastName, profile.suffix].filter(Boolean).join(" ")
    : ""

  const initials = profile
    ? `${profile.firstName?.[0] ?? ""}${profile.lastName?.[0] ?? ""}`.toUpperCase()
    : ""

  const resumeDoc = documents.find((d) => d.requirementName === "Resume" && d.storagePath)

  const sortedHistory = [...statusHistory].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  const sortedInterviews = [...interviews].sort(
    (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
  )

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
          {/* ── Hero ── */}
          <Card>
            <CardContent className="py-5">
              <div className="flex items-start gap-5">
                <Avatar className="size-20 shrink-0">
                  {profile.profilePicture && (
                    <AvatarImage src={profile.profilePicture} alt={fullName} />
                  )}
                  <AvatarFallback className="bg-zinc-700 text-2xl font-semibold text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <h1 className="text-xl font-semibold leading-tight">{fullName}</h1>
                  <p className="mt-0.5 text-sm text-muted-foreground">{profile.personalEmail}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    {applicantStatus && (
                      <Badge variant="outline" className={STATUS_STYLES[applicantStatus] ?? ""}>
                        {applicantStatus}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Profile #{profile.id}
                    {" · "}
                    Created {formatDate(profile.createdAt)}
                    {profile.qualifier && ` · ${profile.qualifier}`}
                  </p>
                </div>

                {/* Resume button */}
                <div className="shrink-0">
                  {isLoading ? (
                    <Button variant="outline" size="sm" disabled>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Resume
                    </Button>
                  ) : resumeDoc ? (
                    <Button variant="outline" size="sm" asChild>
                      <a href={resumeDoc.storagePath!} target="_blank" rel="noopener noreferrer">
                        <FileText className="h-3.5 w-3.5" />
                        Resume
                      </a>
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" disabled>
                      <FileText className="h-3.5 w-3.5" />
                      No resume
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── Main grid ── */}
          <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">

            {/* Left — Personal + Contact merged */}
            <InfoPanel>
              <SectionDivider label="Personal" />
              <Row label="First Name" value={profile.firstName} />
              <Row label="Middle Name" value={profile.middleName} />
              <Row label="Last Name" value={profile.lastName} />
              {profile.suffix && <Row label="Suffix" value={profile.suffix} />}
              <Row label="Date of Birth" value={formatDate(profile.birthDate)} />
              <Row
                label="Age"
                value={profile.age != null ? `${profile.age} years old` : null}
              />
              <Row label="Religion" value={profile.religion} />

              <SectionDivider label="Contact" />
              <Row label="Email" value={profile.personalEmail} />
              <Row label="Phone" value={profile.phoneNumber} />
              <Row label="Mobile" value={profile.mobileNumber} />
              <Row label="Address" value={profile.address} />
            </InfoPanel>

            {/* Right — Status history + Interviews */}
            <div className="space-y-5">
              <InfoPanel>
                <PanelHeader label="Status History" />
                {sortedHistory.length === 0 ? (
                  <p className="px-5 py-10 text-center text-sm text-muted-foreground">
                    No status history recorded.
                  </p>
                ) : (
                  <div className="px-5 py-4">
                    {sortedHistory.map((entry, index) => {
                      const isLast = index === sortedHistory.length - 1
                      return (
                        <div key={entry.id} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div
                              className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${STATUS_DOT[entry.status] ?? "bg-muted-foreground"}`}
                            />
                            {!isLast && <div className="mt-1.5 w-px flex-1 bg-border" />}
                          </div>
                          <div className={!isLast ? "pb-5" : ""}>
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="outline" className={STATUS_STYLES[entry.status] ?? ""}>
                                {entry.status}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(entry.createdAt)}
                              </span>
                            </div>
                            {entry.remarks && (
                              <p className="mt-1 text-sm text-muted-foreground">{entry.remarks}</p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </InfoPanel>

              <InfoPanel>
                <PanelHeader label="Interview Schedules" />
                {sortedInterviews.length === 0 ? (
                  <p className="px-5 py-10 text-center text-sm text-muted-foreground">
                    No interview schedules on record.
                  </p>
                ) : (
                  sortedInterviews.map((interview) => {
                    return (
                      <div key={interview.id} className="border-b px-5 py-4 last:border-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-medium">{formatDateTime(interview.scheduledAt)}</p>
                            {interview.venue && (
                              <p className="mt-0.5 text-sm text-muted-foreground">{interview.venue}</p>
                            )}
                          </div>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            Added {formatDate(interview.createdAt)}
                          </span>
                        </div>
                        {interview.notes && (
                          <p className="mt-2 text-sm text-muted-foreground">{interview.notes}</p>
                        )}
                      </div>
                    )
                  })
                )}
              </InfoPanel>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
