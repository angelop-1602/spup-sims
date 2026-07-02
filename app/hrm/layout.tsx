import { HrmAuthGate, HrmAuthGuard } from "@/components/auth/hrm-auth-guard"
import { AppShell } from "@/components/layout/app-shell"

export default function HrmLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <HrmAuthGuard>
      <AppShell>
        <HrmAuthGate>{children}</HrmAuthGate>
      </AppShell>
    </HrmAuthGuard>
  )
}
