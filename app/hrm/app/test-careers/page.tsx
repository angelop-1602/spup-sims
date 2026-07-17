import type { Metadata } from "next"

import { CareersFooter } from "@/components/hrm/test-careers/careers-footer"
import { CareersHeader } from "@/components/hrm/test-careers/careers-header"
import { CareersHero } from "@/components/hrm/test-careers/careers-hero"
import { CareersInformation } from "@/components/hrm/test-careers/careers-information"
import { JobOpenings } from "@/components/hrm/test-careers/job-openings"
import { INITIAL_JOBS } from "@/components/hrm/types"

export const metadata: Metadata = {
  title: "Careers at SPUP - St. Paul University Philippines",
  description:
    "Explore current employment opportunities and apply through the official St. Paul University Philippines recruitment portal.",
  openGraph: {
    title: "Careers at SPUP",
    description:
      "Explore current employment opportunities at St. Paul University Philippines.",
    type: "website",
  },
}

export default function TestCareersPage() {
  return (
    <div className="min-h-screen overflow-x-clip bg-[#fffefa] text-[#18211c] selection:bg-[#f4e8c5]">
      <a
        href="#main-content"
        className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-md bg-[#063d29] px-4 py-3 font-medium text-white shadow-lg transition-transform focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-[#b78a28] focus:ring-offset-2"
      >
        Skip to main content
      </a>
      <CareersHeader />
      <main id="main-content" tabIndex={-1}>
        <JobOpenings jobs={INITIAL_JOBS} hero={<CareersHero />} />
        <CareersInformation />
      </main>
      <CareersFooter />
    </div>
  )
}
