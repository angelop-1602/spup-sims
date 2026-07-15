export interface ApplicantMePayload {
  id: number | string
  applicationNumber?: string
  status?: string
  resumeUrl?: string | null
  createdAt: string
  profile: {
    id: number | string
    firstName: string
    middleName?: string | null
    lastName: string
    birthDate?: string | null
    age?: number | string | null
    religion?: string | null
    personalEmail?: string | null
    phoneNumber?: string | null
    mobileNumber?: string | null
    address?: string | null
  }
}

export interface ProfileUpdateForm {
  firstName: string
  middleName: string
  lastName: string
  birthDate: string
  religion: string
  personalEmail: string
  phoneNumber: string
  mobileNumber: string
  address: string
}

export interface DocumentType {
  key: string
  label: string
  endpoint: string
}

export const REQUIRED_DOCUMENTS: DocumentType[] = [
  { key: "resume", label: "Resume", endpoint: "/api/v1/applicant/documents/resume" },
  { key: "application_letter", label: "Application Letter", endpoint: "/api/v1/applicant/documents/application-letter" },
  { key: "tor", label: "Transcript of Records (TOR)", endpoint: "/api/v1/applicant/documents/transcript-of-records" },
  { key: "diploma", label: "Diploma", endpoint: "/api/v1/applicant/documents/diploma" }
]

export const IF_APPLICABLE_DOCUMENTS: DocumentType[] = [
  { key: "prc_id", label: "PRC ID", endpoint: "/api/v1/applicant/documents/prc-id" },
  { key: "certificate_of_employment", label: "Certificate of Employment", endpoint: "/api/v1/applicant/documents/certificate-of-employment" },
  { key: "latest_performance_rating", label: "Latest Performance Rating", endpoint: "/api/v1/applicant/documents/latest-performance-rating" },
  { key: "certificates_of_training", label: "Certificates of Training", endpoint: "/api/v1/applicant/documents/certificates-of-training" }
]

export const STATUS_STYLES: Record<string, string> = {
  Draft:     "bg-orange-500/10 text-orange-600 border border-orange-500/20",  
  Interview: "bg-blue-500/10 text-blue-600 border border-blue-500/20",
  Hired:     "bg-green-500/10 text-green-600 border border-green-500/20",
  Rejected:  "bg-red-500/10 text-red-600 border border-red-500/20",
  Pending:   "bg-yellow-500/10 text-yellow-600 border border-yellow-500/20",
  Submitted: "bg-purple-500/10 text-purple-600 border border-purple-500/20",
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
