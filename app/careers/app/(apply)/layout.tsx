import { ApplicantAuthGuard } from "@/components/auth/applicant-auth-guard"

export default function ApplyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ApplicantAuthGuard>
      <div className="min-h-screen w-full bg-muted/30">
        <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
      </div>
    </ApplicantAuthGuard>
  )
}
