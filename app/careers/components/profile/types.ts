export interface ApplicantMePayload {
  id: number | string
  applicationNumber?: string
  status?: string
  createdAt: string
  profile: {
    id: number | string
    firstName: string
    middleName?: string | null
    lastName: string
    suffix?: string | null
    gender?: number | null
    birthDate?: string | null
    civilStatus?: number | null
    age?: number | string | null
    religion?: string | null
    qualifier?: string | null
    personalEmail?: string | null
    phoneNumber?: string | null
    mobileNumber?: string | null
    address?: string | null
  }
}

export interface DocumentEntry {
  id: number | string
  storagePath: string
  requirementName: string
  fileName: string
}

export interface ProfileUpdateForm {
  firstName: string
  middleName: string
  lastName: string
  suffix: string
  gender: string
  birthDate: string
  civilStatus: string
  religion: string
  qualifier: string
  personalEmail: string
  phoneNumber: string
  mobileNumber: string
  address: string
}

export interface DocumentType {
  key: string
  label: string
  endpoint: string
  apiName: string
  accept: string
}

export const REQUIRED_DOCUMENTS: DocumentType[] = [
  { key: "resume", label: "Resume", endpoint: "/api/v1/applicant/documents/resume", apiName: "Resume", accept: ".pdf,.doc,.docx,.jpg,.jpeg,.png" },
  { key: "application_letter", label: "Application Letter", endpoint: "/api/v1/applicant/documents/application-letter", apiName: "Application Letter", accept: ".pdf,.doc,.docx" },
  { key: "transcript_of_records", label: "Transcript of Records (TOR)", endpoint: "/api/v1/applicant/documents/transcript-of-records", apiName: "Transcript of Records", accept: ".pdf,.jpg,.jpeg,.png" },
  { key: "diploma", label: "Diploma", endpoint: "/api/v1/applicant/documents/diploma", apiName: "Diploma", accept: ".pdf,.jpg,.jpeg,.png" }
]

export const IF_APPLICABLE_DOCUMENTS: DocumentType[] = [
  { key: "prc_id", label: "PRC ID", endpoint: "/api/v1/applicant/documents/prc-id", apiName: "PRC ID", accept: ".pdf,.jpg,.jpeg,.png" },
  { key: "certificate_of_employment", label: "Certificate of Employment", endpoint: "/api/v1/applicant/documents/certificate-of-employment", apiName: "Certificate of Employment", accept: ".pdf,.jpg,.jpeg,.png" },
  { key: "latest_performance_rating", label: "Latest Performance Rating", endpoint: "/api/v1/applicant/documents/latest-performance-rating", apiName: "Latest Performance Rating", accept: ".pdf,.jpg,.jpeg,.png" },
  { key: "certificates_of_training", label: "Certificates of Training", endpoint: "/api/v1/applicant/documents/certificates-of-training", apiName: "Certificates of Training", accept: ".pdf,.jpg,.jpeg,.png" }
]

export const STATUS_STYLES: Record<string, string> = {
  Draft:     "bg-orange-500/10 text-orange-600 border border-orange-500/20",  
  Interview: "bg-blue-500/10 text-blue-600 border border-blue-500/20",
  Hired:     "bg-green-500/10 text-green-600 border border-green-500/20",
  Rejected:  "bg-red-500/10 text-red-600 border border-red-500/20",
  Pending:   "bg-yellow-500/10 text-yellow-600 border border-yellow-500/20",
  Submitted: "bg-purple-500/10 text-purple-600 border border-purple-500/20",
}

export const GENDER_LABELS: Record<number, string> = {
  0: "Unspecified",
  1: "Female",
  2: "Male",
  3: "Other"
}

export const CIVIL_STATUS_LABELS: Record<number, string> = {
  0: "Unspecified",
  1: "Single",
  2: "Married",
  3: "Widowed",
  4: "Separated"
}

export const GENDER_BY_LABEL: Record<string, number> = {
  Female: 1,
  Male: 2,
  Other: 3,
  Unspecified: 0,
}

export const CIVIL_STATUS_BY_LABEL: Record<string, number> = {
  Single: 1,
  Married: 2,
  Widowed: 3,
  Separated: 4,
  Unspecified: 0,
}

export function normalizeGender(value: unknown): number {
  if (typeof value === "number") return value
  if (typeof value === "string") return GENDER_BY_LABEL[value] ?? 0
  return 0
}

export function normalizeCivilStatus(value: unknown): number {
  if (typeof value === "number") return value
  if (typeof value === "string") return CIVIL_STATUS_BY_LABEL[value] ?? 0
  return 0
}

export type DocKind = "pdf" | "image" | "word" | "other"

export function getDocKind(fileName: string, mimeType?: string): DocKind {
  const type = (mimeType || "").toLowerCase()
  const ext = fileName.split(".").pop()?.toLowerCase() || ""

  if (type.includes("pdf") || ext === "pdf") return "pdf"
  if (type.startsWith("image/") || ["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "image"
  if (type.includes("word") || type.includes("wordprocessingml") || ["doc", "docx"].includes(ext)) return "word"
  return "other"
}

export function calculateAge(birthDateString: string | null | undefined): string {
  if (!birthDateString) return "—"
  const birthDate = new Date(birthDateString)
  if (isNaN(birthDate.getTime())) return "—"
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDifference = today.getMonth() - birthDate.getMonth()
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age >= 0 ? age.toString() : "—"
}
