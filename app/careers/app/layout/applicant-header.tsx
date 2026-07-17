"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"

import { AccountMenu } from "@/components/auth/account-menu"
import { useApplicantProfile } from "@/components/auth/applicant-auth-guard"
import { logout } from "@/hooks/use-auth-status"

export function ApplicantHeader() {
  const router = useRouter()
  const { profile } = useApplicantProfile()
  const displayName = profile
    ? `${profile.profile.firstName} ${profile.profile.lastName}`.trim()
    : "Applicant User"
  const emailLabel = profile?.profile.personalEmail || ""

  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <div className="w-9 h-9 flex items-center justify-center">
              <img
                src="/SPUP-final-logo.png"
                alt="SPUP Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-left flex flex-col justify-center">
              <h1 className="font-poppins text-sm font-extrabold text-neutral-900 tracking-tight leading-none uppercase">
                SPUP HRM Careers
              </h1>
              <span className="font-epilogue text-[10px] font-bold text-neutral-400 mt-1 leading-none">
                St. Paul University Philippines
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-6 ml-auto font-epilogue">
            <Link
              href="/"
              className="text-[11px] font-semibold text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/job-openings"
              className="text-[11px] font-semibold text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              Job Openings
            </Link>
            <Link
              href="/#process"
              className="text-[11px] font-semibold text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              Application Process
            </Link>
            <Link
              href="/#faqs"
              className="text-[11px] font-semibold text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              FAQs
            </Link>

            <AccountMenu displayName={displayName} email={emailLabel} onLogout={() => logout(router)} />
          </nav>
        </div>
      </div>
    </header>
  )
}
