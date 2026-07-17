import { ApplicantHeader } from "@/app/layout/applicant-header"
import { ApplicantAuthGuard } from "@/components/auth/applicant-auth-guard"

export default function ApplicantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ApplicantAuthGuard>
      <div className="min-h-screen w-full bg-muted/30">
        <ApplicantHeader />
        <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
      </div>
    </ApplicantAuthGuard>
  )
}
