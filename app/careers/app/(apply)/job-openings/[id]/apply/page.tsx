"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  MapPin,
  Briefcase,
  Building2,
  Clock,
  Pencil,
  CopyCheck,
} from "lucide-react"
import { Epilogue } from "next/font/google"
import { z } from "zod"
import { useApplicantProfile } from "@/components/auth/applicant-auth-guard"
import {
  Job,
  SingleJobPostingApiResponse,
  mapApiJobToJob,
} from "@/components/landing/types"
import {
  REQUIRED_DOCUMENTS,
  type ProfileUpdateForm,
  type DocumentEntry,
} from "@/components/profile/types"
import { request, ApiError } from "@/lib/api/client"

const epilogue = Epilogue({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

const NAME_PATTERN = /^[A-Za-z\s'-]+$/

const profileSchema = z.object({
  firstName: z.string().trim().min(1, "First Name is required.").regex(NAME_PATTERN, "Enter a valid name."),
  middleName: z.string().refine((v) => !v.trim() || NAME_PATTERN.test(v), "Enter a valid name."),
  lastName: z.string().trim().min(1, "Last Name is required.").regex(NAME_PATTERN, "Enter a valid name."),
  suffix: z.string().refine((v) => !v.trim() || NAME_PATTERN.test(v), "Enter a valid suffix."),
  gender: z.string(),
  birthDate: z
    .string()
    .trim()
    .min(1, "Date of Birth is required.")
    .refine((v) => new Date(v) <= new Date(), "Enter a valid date of birth."),
  civilStatus: z.string(),
  religion: z.string().refine((v) => !v.trim() || NAME_PATTERN.test(v), "Enter a valid religion."),
  qualifier: z.string().refine((v) => !v.trim() || /^[A-Za-z0-9\s.'-]+$/.test(v), "Enter a valid qualifier."),
  personalEmail: z.email("Enter a valid email address."),
  phoneNumber: z.string(),
  mobileNumber: z.string(),
  address: z.string(),
})

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "").replace(/^63/, "")
}

function formatDigits(raw: string, grouping: number[]): string {
  let result = ""
  let i = 0
  for (const size of grouping) {
    if (i >= raw.length) break
    if (result) result += "-"
    result += raw.slice(i, i + size)
    i += size
  }
  if (i < raw.length) {
    if (result) result += "-"
    result += raw.slice(i)
  }
  return result
}

function isAlreadyAppliedError(err: unknown): boolean {
  if (err instanceof ApiError) {
    if (err.status === 409) return true
    const msg = (err.message || "").toLowerCase()
    if (msg.includes("already applied") || msg.includes("duplicate") || msg.includes("conflict")) return true
  }
  return false
}

export default function ApplyPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const { profile, refetch: refetchProfile } = useApplicantProfile()

  const [job, setJob] = React.useState<Job | null>(null)
  const [loadingJob, setLoadingJob] = React.useState(true)
  const [notFound, setNotFound] = React.useState(false)

  const [documents, setDocuments] = React.useState<DocumentEntry[]>([])
  const [loadingDocs, setLoadingDocs] = React.useState(true)

  const [editForm, setEditFormRaw] = React.useState<ProfileUpdateForm>({
    firstName: "",
    middleName: "",
    lastName: "",
    suffix: "",
    gender: "0",
    birthDate: "",
    civilStatus: "0",
    religion: "",
    qualifier: "",
    personalEmail: "",
    phoneNumber: "",
    mobileNumber: "",
    address: "",
  })
  const [fieldErrors, setFieldErrors] = React.useState<Partial<Record<keyof ProfileUpdateForm, string>>>({})
  const [profileModified, setProfileModified] = React.useState(false)

  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isSuccess, setIsSuccess] = React.useState(false)
  const [alreadyApplied, setAlreadyApplied] = React.useState(false)
  const [submitError, setSubmitError] = React.useState<string | null>(null)

  const [showOptional, setShowOptional] = React.useState(false)

  const setEditForm = (updater: ProfileUpdateForm | ((prev: ProfileUpdateForm) => ProfileUpdateForm)) => {
    setProfileModified(true)
    setFieldErrors({})
    setSubmitError(null)
    if (typeof updater === "function") {
      setEditFormRaw(updater)
    } else {
      setEditFormRaw(updater)
    }
  }

  React.useEffect(() => {
    if (profile?.profile) {
      const p = profile.profile
      setEditFormRaw({
        firstName: p.firstName || "",
        middleName: p.middleName || "",
        lastName: p.lastName || "",
        suffix: p.suffix || "",
        gender: String(p.gender ?? 0),
        birthDate: p.birthDate || "",
        civilStatus: String(p.civilStatus ?? 0),
        religion: p.religion || "",
        qualifier: p.qualifier || "",
        personalEmail: p.personalEmail || "",
        phoneNumber: p.phoneNumber || "",
        mobileNumber: p.mobileNumber || "",
        address: p.address || "",
      })
    }
  }, [profile])

  React.useEffect(() => {
    if (!id) return
    let cancelled = false

    async function fetchJob() {
      setLoadingJob(true)
      setNotFound(false)
      try {
        const res = await fetch(`/api/v1/applicant/job-postings/${id}`)
        if (!res.ok) throw new Error("Failed to fetch")
        const json: SingleJobPostingApiResponse = await res.json()
        if (!cancelled && json.success && json.data) {
          setJob(mapApiJobToJob(json.data))
          setLoadingJob(false)
          return
        }
      } catch {
        // fall through to not found
      }
      if (!cancelled) setNotFound(true)
      if (!cancelled) setLoadingJob(false)
    }

    fetchJob()
    return () => { cancelled = true }
  }, [id])

  React.useEffect(() => {
    let cancelled = false
    async function fetchDocs() {
      setLoadingDocs(true)
      try {
        const token = localStorage.getItem("access_token")
        if (!token) return
        const res = await fetch("/api/v1/applicant/documents", {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        })
        if (!res.ok) return
        const payload = await res.json()
        const entries = payload?.data ?? payload?.documents ?? payload
        if (!cancelled && Array.isArray(entries)) setDocuments(entries)
      } catch {
        // ignore
      }
      if (!cancelled) setLoadingDocs(false)
    }
    fetchDocs()
    return () => { cancelled = true }
  }, [])

  const isProfileComplete = React.useMemo(() => {
    if (!profile) return false
    const p = profile.profile
    return !!(p.firstName?.trim() && p.lastName?.trim() && p.birthDate && p.personalEmail?.trim())
  }, [profile])

  const uploadedDocNames = React.useMemo(() => documents.map((d) => d.requirementName), [documents])

  const missingDocs = React.useMemo(
    () => REQUIRED_DOCUMENTS.filter((doc) => !uploadedDocNames.includes(doc.apiName)),
    [uploadedDocNames],
  )

  const isDocumentsComplete = missingDocs.length === 0

  const isFormValid = React.useMemo(() => profileSchema.safeParse(editForm).success, [editForm])

  const canSubmit = isFormValid && isDocumentsComplete

  const handleSubmit = async () => {
    setSubmitError(null)
    setAlreadyApplied(false)

    const result = profileSchema.safeParse(editForm)
    if (!result.success) {
      const flat = z.flattenError(result.error).fieldErrors
      setFieldErrors({
        firstName: flat.firstName?.[0],
        middleName: flat.middleName?.[0],
        lastName: flat.lastName?.[0],
        suffix: flat.suffix?.[0],
        gender: flat.gender?.[0],
        birthDate: flat.birthDate?.[0],
        civilStatus: flat.civilStatus?.[0],
        religion: flat.religion?.[0],
        qualifier: flat.qualifier?.[0],
        personalEmail: flat.personalEmail?.[0],
        phoneNumber: flat.phoneNumber?.[0],
        mobileNumber: flat.mobileNumber?.[0],
        address: flat.address?.[0],
      })
      return
    }

    setIsSubmitting(true)

    try {
      if (profileModified) {
        const token = localStorage.getItem("access_token")
        if (!token) throw new Error("No active session.")

        const body = {
          firstName: editForm.firstName,
          middleName: editForm.middleName || null,
          lastName: editForm.lastName,
          suffix: editForm.suffix || null,
          gender: Number(editForm.gender),
          birthDate: editForm.birthDate,
          civilStatus: Number(editForm.civilStatus),
          religion: editForm.religion || null,
          qualifier: editForm.qualifier || null,
          phoneNumber: editForm.phoneNumber || null,
          mobileNumber: editForm.mobileNumber || null,
          address: editForm.address || null,
        }

        const res = await fetch("/api/v1/applicant/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(body),
        })

        if (!res.ok) throw new Error("Failed to save your profile. Please try again.")
        await refetchProfile()
      }

      await request("/api/v1/applicant/job-applications", {
        method: "POST",
        body: { jobPostingId: Number(id) },
      })

      setIsSuccess(true)
      setTimeout(() => {
        router.push("/applicant/job-applications")
      }, 1800)
    } catch (err) {
      if (isAlreadyAppliedError(err)) {
        setAlreadyApplied(true)
      } else if (err instanceof ApiError) {
        setSubmitError(err.message)
      } else {
        setSubmitError(err instanceof Error ? err.message : "An unexpected error occurred.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loadingJob) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-neutral-100 rounded w-32" />
          <div className="h-32 bg-neutral-100 rounded-xl" />
          <div className="h-48 bg-neutral-100 rounded-xl" />
        </div>
      </div>
    )
  }

  if (notFound || !job) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6">
        <AlertCircle className="w-10 h-10 text-neutral-400 mb-4" />
        <h3 className={`${epilogue.className} text-lg font-bold text-neutral-800 mb-2`}>
          Job Posting Not Found
        </h3>
        <p className={`${epilogue.className} text-sm text-neutral-500 text-center max-w-md mb-6`}>
          The position you&apos;re trying to apply for doesn&apos;t exist or may have been removed.
        </p>
        <Link
          href="/job-openings"
          className={`${epilogue.className} inline-flex items-center justify-center gap-2 px-5 py-2.5 border-2 border-emerald-950 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-[4px_4px_0px_0px_#022c22] transition-all duration-150 hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none`}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Openings
        </Link>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="space-y-6">
        <Link
          href={`/job-openings/${id}`}
          className={`${epilogue.className} inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-neutral-900 uppercase tracking-wider transition-colors`}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Job Details
        </Link>

        <div className="bg-white border-2 border-emerald-950 rounded-xl p-8 text-center [box-shadow:4px_4px_0px_0px_#facc15,5px_5px_0px_0px_#022c22]">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5 border-2 border-green-200">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h3 className={`${epilogue.className} text-lg font-bold text-neutral-900 mb-2`}>
            Application Submitted!
          </h3>
          <p className={`${epilogue.className} text-sm text-neutral-500 max-w-md mx-auto leading-relaxed mb-2`}>
            Your application for <strong>{job.title}</strong> has been submitted.
            Your status is currently <strong>Pending</strong> — you&apos;ll be notified as it updates.
          </p>
          <p className={`${epilogue.className} text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed mb-6`}>
            Redirecting you to your dashboard...
          </p>
          <Link
            href="/applicant/job-applications"
            className={`${epilogue.className} inline-flex items-center justify-center gap-2 px-5 py-2.5 border-2 border-emerald-950 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-[4px_4px_0px_0px_#022c22] transition-all duration-150 hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none`}
          >
            Go to Dashboard Now
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Link
        href={`/job-openings/${id}`}
        className={`${epilogue.className} inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-neutral-900 uppercase tracking-wider transition-colors`}
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Job Details
      </Link>

      <div>
        <h1 className={`${epilogue.className} text-xl font-bold text-neutral-900`}>
          Apply for Position
        </h1>
        <p className={`${epilogue.className} text-sm text-neutral-500 mt-1`}>
          Submit your profile as your application for this role.
        </p>
      </div>

      <div className="bg-white border-2 border-emerald-950 rounded-xl overflow-hidden [box-shadow:4px_4px_0px_0px_#facc15,5px_5px_0px_0px_#022c22]">
        <div className="bg-emerald-800 px-6 py-5 border-b-2 border-emerald-950">
          <span className={`${epilogue.className} text-[10px] font-semibold uppercase tracking-widest text-amber-400`}>
            {job.department || "Position Opening"}
          </span>
          <h2 className={`${epilogue.className} text-lg md:text-xl font-bold text-white mt-1 leading-snug tracking-wide`}>
            {job.title}
          </h2>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            {job.location && (
              <span className={`${epilogue.className} inline-flex items-center gap-1.5 text-[10px] font-semibold bg-emerald-900/50 text-emerald-100 px-2.5 py-1 rounded border border-emerald-700`}>
                <MapPin className="w-3 h-3" />
                {job.location}
              </span>
            )}
            <span className={`${epilogue.className} inline-flex items-center gap-1.5 text-[10px] font-semibold bg-emerald-900/50 text-emerald-100 px-2.5 py-1 rounded border border-emerald-700`}>
              <Briefcase className="w-3 h-3" />
              {job.type}
            </span>
            <span className={`${epilogue.className} inline-flex items-center gap-1.5 text-[10px] font-semibold bg-emerald-900/50 text-emerald-100 px-2.5 py-1 rounded border border-emerald-700`}>
              <Building2 className="w-3 h-3" />
              {job.workplace}
            </span>
            <span className={`${epilogue.className} inline-flex items-center gap-1.5 text-[10px] font-semibold bg-emerald-900/50 text-emerald-100 px-2.5 py-1 rounded border border-emerald-700`}>
              <Clock className="w-3 h-3" />
              {job.experienceLevel}
            </span>
          </div>
        </div>
        <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100">
          <p className={`${epilogue.className} text-xs text-neutral-500 leading-relaxed line-clamp-2`}>
            {job.description}
          </p>
        </div>
      </div>

      {alreadyApplied && (
        <div className="bg-white border-2 border-blue-200 rounded-xl p-6 [box-shadow:4px_4px_0px_0px_#bfdbfe,5px_5px_0px_0px_#1e40af]">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center shrink-0 border border-blue-200">
              <CopyCheck className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className={`${epilogue.className} text-sm font-bold text-neutral-900 mb-1`}>
                You&apos;ve already applied to this position
              </h3>
              <p className={`${epilogue.className} text-xs text-neutral-500 leading-relaxed mb-4`}>
                You have a submitted application for <strong>{job.title}</strong>. You can track its current status and updates from your dashboard.
              </p>
              <div className="flex items-center gap-3">
                <Link
                  href="/applicant/job-applications"
                  className={`${epilogue.className} inline-flex items-center justify-center gap-2 px-5 py-2.5 border-2 border-emerald-950 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-[4px_4px_0px_0px_#022c22] transition-all duration-150 hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none`}
                >
                  View My Applications
                </Link>
                <Link
                  href={`/job-openings/${id}`}
                  className={`${epilogue.className} inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-neutral-200 hover:border-neutral-900 text-neutral-600 hover:text-neutral-900 rounded-lg text-xs font-semibold bg-white transition-colors`}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Job Details
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {!alreadyApplied && (
        <>
          <div className="bg-white border border-neutral-200 rounded-xl p-5">
            <h3 className={`${epilogue.className} text-sm font-bold text-neutral-800 mb-1`}>
              Your Profile
            </h3>
            <p className={`${epilogue.className} text-[11px] text-neutral-400 mb-4`}>
              Your profile information will be submitted as your application. Please ensure all required fields are complete.
            </p>

            {!isProfileComplete && (
              <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-lg mb-4">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className={`${epilogue.className} text-xs font-semibold text-amber-800`}>
                    Your profile is incomplete
                  </p>
                  <p className={`${epilogue.className} text-[11px] text-amber-700 mt-0.5`}>
                    Please fill in all required fields below before submitting your application.
                  </p>
                </div>
              </div>
            )}

            {isProfileComplete && !profileModified && (
              <div className="flex items-start gap-2.5 p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className={`${epilogue.className} text-xs font-semibold text-green-800`}>
                    Your profile is complete
                  </p>
                  <p className={`${epilogue.className} text-[11px] text-green-700 mt-0.5`}>
                    All required fields are filled. You can review and update below, or submit your application.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
              <FieldInput
                label="First Name"
                required
                placeholder="Juan"
                value={editForm.firstName}
                onChange={(v) => setEditForm((prev) => ({ ...prev, firstName: v }))}
                error={fieldErrors.firstName}
              />
              <FieldInput
                label="Middle Name"
                placeholder="Santos"
                value={editForm.middleName}
                onChange={(v) => setEditForm((prev) => ({ ...prev, middleName: v }))}
                error={fieldErrors.middleName}
              />
              <FieldInput
                label="Last Name"
                required
                placeholder="Dela Cruz"
                value={editForm.lastName}
                onChange={(v) => setEditForm((prev) => ({ ...prev, lastName: v }))}
                error={fieldErrors.lastName}
              />
              <FieldInput
                label="Suffix"
                placeholder="Jr, III, etc."
                value={editForm.suffix}
                onChange={(v) => setEditForm((prev) => ({ ...prev, suffix: v }))}
                error={fieldErrors.suffix}
              />
              <FieldDate
                label="Date of Birth"
                required
                value={editForm.birthDate}
                onChange={(v) => setEditForm((prev) => ({ ...prev, birthDate: v }))}
                error={fieldErrors.birthDate}
              />
              <FieldSelect
                label="Gender"
                value={editForm.gender}
                onChange={(v) => setEditForm((prev) => ({ ...prev, gender: v }))}
                options={[
                  { value: "0", label: "Unspecified" },
                  { value: "1", label: "Female" },
                  { value: "2", label: "Male" },
                  { value: "3", label: "Other" },
                ]}
              />
              <FieldSelect
                label="Civil Status"
                value={editForm.civilStatus}
                onChange={(v) => setEditForm((prev) => ({ ...prev, civilStatus: v }))}
                options={[
                  { value: "0", label: "Unspecified" },
                  { value: "1", label: "Single" },
                  { value: "2", label: "Married" },
                  { value: "3", label: "Widowed" },
                  { value: "4", label: "Separated" },
                ]}
              />
              <FieldInput
                label="Email"
                type="email"
                required
                placeholder="juan.delacruz@email.com"
                value={editForm.personalEmail}
                onChange={(v) => setEditForm((prev) => ({ ...prev, personalEmail: v }))}
                error={fieldErrors.personalEmail}
              />
            </div>

            <button
              type="button"
              onClick={() => setShowOptional(!showOptional)}
              className={`${epilogue.className} mt-4 inline-flex items-center gap-1.5 text-[11px] font-semibold text-neutral-500 hover:text-neutral-800 transition-colors`}
            >
              <Pencil className="w-3 h-3" />
              {showOptional ? "Hide" : "Edit"} optional fields
            </button>

            {showOptional && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 mt-4 pt-4 border-t border-neutral-100">
                <FieldInput
                  label="Religion"
                  placeholder="e.g. Roman Catholic"
                  value={editForm.religion}
                  onChange={(v) => setEditForm((prev) => ({ ...prev, religion: v }))}
                  error={fieldErrors.religion}
                />
                <FieldInput
                  label="Qualifier"
                  placeholder="e.g. DIT, MIT"
                  value={editForm.qualifier}
                  onChange={(v) => setEditForm((prev) => ({ ...prev, qualifier: v }))}
                  error={fieldErrors.qualifier}
                />
                <FieldPhone
                  label="Phone"
                  prefix="+63-"
                  placeholder="78-000-0000"
                  maxDigits={9}
                  grouping={[2, 3, 4]}
                  value={editForm.phoneNumber}
                  onChange={(v) => setEditForm((prev) => ({ ...prev, phoneNumber: v }))}
                  error={fieldErrors.phoneNumber}
                />
                <FieldPhone
                  label="Mobile"
                  prefix="+63-"
                  placeholder="900-000-0000"
                  maxDigits={10}
                  grouping={[3, 3, 4]}
                  value={editForm.mobileNumber}
                  onChange={(v) => setEditForm((prev) => ({ ...prev, mobileNumber: v }))}
                  error={fieldErrors.mobileNumber}
                />
                <div className="sm:col-span-2">
                  <FieldInput
                    label="Address"
                    placeholder="e.g. Mabini Street, Ugac Norte, Tuguegarao City, Cagayan"
                    value={editForm.address}
                    onChange={(v) => setEditForm((prev) => ({ ...prev, address: v }))}
                    error={fieldErrors.address}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="bg-white border border-neutral-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className={`${epilogue.className} text-sm font-bold text-neutral-800`}>
                Required Documents
              </h3>
              {loadingDocs ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-400" />
              ) : (
                <span className={`${epilogue.className} text-[10px] font-semibold ${isDocumentsComplete ? "text-green-600" : "text-amber-600"}`}>
                  {REQUIRED_DOCUMENTS.length - missingDocs.length}/{REQUIRED_DOCUMENTS.length} uploaded
                </span>
              )}
            </div>

            <div className="space-y-2">
              {REQUIRED_DOCUMENTS.map((doc) => {
                const isUploaded = uploadedDocNames.includes(doc.apiName)
                return (
                  <div
                    key={doc.key}
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-neutral-50 border border-neutral-100"
                  >
                    {isUploaded ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`${epilogue.className} text-xs font-semibold text-neutral-700`}>
                        {doc.label}
                      </p>
                    </div>
                    <span className={`${epilogue.className} text-[10px] font-semibold ${isUploaded ? "text-green-600" : "text-neutral-400"}`}>
                      {isUploaded ? "Uploaded" : "Missing"}
                    </span>
                  </div>
                )
              })}
            </div>

            {!isDocumentsComplete && (
              <p className={`${epilogue.className} text-[10px] text-neutral-400 mt-3 leading-relaxed`}>
                Upload missing documents from your{" "}
                <a href="/applicant/profile" className="underline text-neutral-600 hover:text-neutral-900">
                  profile page
                </a>{" "}
                before submitting this application.
              </p>
            )}
          </div>

          {submitError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className={`${epilogue.className} text-xs text-red-600`}>{submitError}</p>
            </div>
          )}

          <div className="bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3">
            <p className={`${epilogue.className} text-[11px] text-neutral-500 leading-relaxed`}>
              By submitting, your profile information will be sent as your application. The default status will be <strong>Pending</strong> until reviewed by the HR team.
            </p>
          </div>

          <div className="flex items-center justify-between">
            <Link
              href={`/job-openings/${id}`}
              className={`${epilogue.className} text-[11px] font-semibold text-neutral-400 hover:text-neutral-700 transition-colors`}
            >
              Cancel
            </Link>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !canSubmit}
              className={`${epilogue.className} inline-flex items-center justify-center gap-2 px-6 py-2.5 border-2 border-emerald-950 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-[4px_4px_0px_0px_#022c22] transition-all duration-150 hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0px_0px_#022c22]`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Application"
              )}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function FieldInput({
  label,
  type = "text",
  required = false,
  placeholder,
  value,
  onChange,
  error,
}: {
  label: string
  type?: string
  required?: boolean
  placeholder?: string
  value: string
  onChange: (value: string) => void
  error?: string
}) {
  return (
    <div>
      <label className={`${epilogue.className} mb-1.5 block text-xs font-semibold text-neutral-700`}>
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`${epilogue.className} w-full px-3 py-2 text-xs text-neutral-700 bg-neutral-50 border rounded-lg focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-colors placeholder:text-neutral-300 ${error ? "border-red-300" : "border-neutral-200"}`}
      />
      {error && <p className={`${epilogue.className} mt-1 text-[10px] text-red-500`}>{error}</p>}
    </div>
  )
}

function FieldDate({
  label,
  required = false,
  value,
  onChange,
  error,
}: {
  label: string
  required?: boolean
  value: string
  onChange: (value: string) => void
  error?: string
}) {
  return (
    <div>
      <label className={`${epilogue.className} mb-1.5 block text-xs font-semibold text-neutral-700`}>
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      <input
        type="date"
        value={value}
        max={new Date().toISOString().split("T")[0]}
        onChange={(e) => onChange(e.target.value)}
        className={`${epilogue.className} w-full px-3 py-2 text-xs text-neutral-700 bg-neutral-50 border rounded-lg focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-colors ${error ? "border-red-300" : "border-neutral-200"}`}
      />
      {error && <p className={`${epilogue.className} mt-1 text-[10px] text-red-500`}>{error}</p>}
    </div>
  )
}

function FieldSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div>
      <label className={`${epilogue.className} mb-1.5 block text-xs font-semibold text-neutral-700`}>
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${epilogue.className} w-full px-3 py-2 text-xs text-neutral-700 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-colors`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

function FieldPhone({
  label,
  prefix,
  placeholder,
  maxDigits,
  grouping,
  value,
  onChange,
  error,
}: {
  label: string
  prefix: string
  placeholder: string
  maxDigits: number
  grouping: number[]
  value: string
  onChange: (value: string) => void
  error?: string
}) {
  const rawDigits = React.useMemo(() => digitsOnly(value), [value])
  const formatted = React.useMemo(() => formatDigits(rawDigits, grouping), [rawDigits, grouping])

  return (
    <div>
      <label className={`${epilogue.className} mb-1.5 block text-xs font-semibold text-neutral-700`}>
        {label}
      </label>
      <div className="flex">
        <span className={`${epilogue.className} flex items-center px-2.5 text-xs text-neutral-400 bg-neutral-100 border border-r-0 border-neutral-200 rounded-l-lg select-none`}>
          {prefix}
        </span>
        <input
          type="tel"
          inputMode="numeric"
          pattern="[0-9-]*"
          value={formatted}
          placeholder={placeholder}
          onChange={(e) => {
            const raw = e.target.value.replace(/\D/g, "").slice(0, maxDigits)
            onChange(raw ? `${prefix}${formatDigits(raw, grouping)}` : "")
          }}
          className={`${epilogue.className} flex-1 px-3 py-2 text-xs text-neutral-700 bg-neutral-50 border border-neutral-200 rounded-r-lg focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-colors placeholder:text-neutral-300 ${error ? "border-red-300" : ""}`}
        />
      </div>
      {error && <p className={`${epilogue.className} mt-1 text-[10px] text-red-500`}>{error}</p>}
    </div>
  )
}
