import { AppShell } from "@/app/layout/app-shell"
import { ApplicantAuthGuard } from "@/components/auth/applicant-auth-guard"

export default function ApplicantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ApplicantAuthGuard>
      <AppShell>{children}</AppShell>
    </ApplicantAuthGuard>
  )
}