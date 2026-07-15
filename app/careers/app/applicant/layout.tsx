import { AppShell } from "@/app/layout/app-shell"

export default function ApplicantLayout({
   children,
 }: {
   children: React.ReactNode
 }) {
   return <AppShell>{children}</AppShell>
 }