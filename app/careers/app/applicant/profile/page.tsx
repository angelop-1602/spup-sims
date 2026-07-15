"use client"

import * as React from "react"
import { Loader2, AlertCircle, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ApplicantMePayload {
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
    birthDate?: string | null  // Fixed
    age?: number | string | null
    religion?: string | null
    personalEmail?: string | null
    phoneNumber?: string | null // Fixed
    mobileNumber?: string | null // Fixed
    address?: string | null
  }
}

const STATUS_STYLES: Record<string, string> = {
  Interview: "bg-blue-500/10 text-blue-600 border border-blue-500/20",
  Hired:     "bg-green-500/10 text-green-600 border border-green-500/20",
  Rejected:  "bg-red-500/10 text-red-600 border border-red-500/20",
  Pending:   "bg-yellow-500/10 text-yellow-600 border border-yellow-500/20",
  Submitted: "bg-purple-500/10 text-purple-600 border border-purple-500/20",
}

export default function ApplicantSelfProfilePage() {
  const [data, setData] = React.useState<ApplicantMePayload | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchMyProfile = React.useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem("access_token")

      if (!token) {
        throw new Error("No active session found. Please log in.")
      }

      const response = await fetch("/api/v1/applicant/me", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      })

      if (response.status === 401) {
        throw new Error("Unauthorized access. Please log in again.")
      }

      if (!response.ok) {
        throw new Error(`Server returned error status code: ${response.status}`)
      }

      const payload = await response.json()
      setData(payload?.data || payload)

    } catch (err: any) {
      setError(err.message || "Failed to retrieve your applicant profile.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchMyProfile()
  }, [fetchMyProfile])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-600" />
        <p>Retrieving your profile details...</p>
      </div>
    )
  }

  if (error || !data || !data.profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] gap-3 p-4 text-center max-w-sm mx-auto">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="text-sm font-medium text-neutral-900">Unable to load profile</p>
        <p className="text-xs text-muted-foreground">{error}</p>
        <Button variant="outline" size="sm" onClick={fetchMyProfile} className="mt-1">
          Retry
        </Button>
      </div>
    )
  }

  const { profile } = data
  const statusStyle = STATUS_STYLES[data.status || "Submitted"] ?? "bg-neutral-100 text-neutral-600"
  const createdString = new Date(data.createdAt || Date.now()).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric"
  })

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 bg-neutral-50/30 min-h-screen">
      
      {/* Top Profile Banner Card */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 shrink-0 rounded-full bg-[#373A40] text-white flex items-center justify-center text-lg font-semibold uppercase">
            {profile.firstName && profile.lastName 
              ? `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}` 
              : "—"}
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-semibold text-neutral-950">
              {profile.firstName} {profile.lastName}
            </h1>
            <p className="text-sm text-neutral-500">{profile.personalEmail || "—"}</p>
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyle}`}>
                {data.status || "Submitted"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground pt-1">
              Profile #{profile.id} · Created {createdString}
            </p>
          </div>
        </div>

        <div>
          <Button variant="outline" className="text-sm font-normal text-neutral-600 bg-white border-neutral-200 shadow-none hover:bg-neutral-50">
            <FileText className="mr-2 h-4 w-4 text-neutral-400" />
            {data.resumeUrl ? "View resume" : "No resume"}
          </Button>
        </div>
      </div>

      {/* Structured Details Matrix Lists */}
      <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden shadow-sm">
        
        {/* PERSONAL Section */}
        <div className="bg-neutral-50/75 px-4 py-2 border-b border-neutral-200">
          <h2 className="text-xs font-bold tracking-wider text-neutral-500 uppercase">Personal</h2>
        </div>
        <div className="divide-y divide-neutral-100 text-sm">
          <div className="grid grid-cols-3 px-4 py-3">
            <span className="text-neutral-500">First Name</span>
            <span className="col-span-2 font-medium text-neutral-900">{profile.firstName || "—"}</span>
          </div>
          <div className="grid grid-cols-3 px-4 py-3">
            <span className="text-neutral-500">Middle Name</span>
            <span className="col-span-2 text-neutral-900">{profile.middleName || "—"}</span>
          </div>
          <div className="grid grid-cols-3 px-4 py-3">
            <span className="text-neutral-500">Last Name</span>
            <span className="col-span-2 font-medium text-neutral-900">{profile.lastName || "—"}</span>
          </div>
          <div className="grid grid-cols-3 px-4 py-3">
            <span className="text-neutral-500">Date of Birth</span>
            <span className="col-span-2 text-neutral-900">{profile.birthDate || "—"}</span>
          </div>
          <div className="grid grid-cols-3 px-4 py-3">
            <span className="text-neutral-500">Age</span>
            <span className="col-span-2 text-neutral-900">{profile.age || "—"}</span>
          </div>
          <div className="grid grid-cols-3 px-4 py-3">
            <span className="text-neutral-500">Religion</span>
            <span className="col-span-2 text-neutral-900">{profile.religion || "—"}</span>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-neutral-50/75 px-4 py-2 border-t border-b border-neutral-200">
          <h2 className="text-xs font-bold tracking-wider text-neutral-500 uppercase">Contact</h2>
        </div>
        <div className="divide-y divide-neutral-100 text-sm">
          <div className="grid grid-cols-3 px-4 py-3">
            <span className="text-neutral-500">Email</span>
            <span className="col-span-2 font-medium text-neutral-900">{profile.personalEmail || "—"}</span>
          </div>
          <div className="grid grid-cols-3 px-4 py-3">
            <span className="text-neutral-500">Phone</span>
            <span className="col-span-2 text-neutral-900">{profile.phoneNumber || "—"}</span>
          </div>
          <div className="grid grid-cols-3 px-4 py-3">
            <span className="text-neutral-500">Mobile</span>
            <span className="col-span-2 text-neutral-900">{profile.mobileNumber || "—"}</span>
          </div>
          <div className="grid grid-cols-3 px-4 py-3">
            <span className="text-neutral-500">Address</span>
            <span className="col-span-2 text-neutral-900">{profile.address || "—"}</span>
          </div>
        </div>

      </div>
    </div>
  )
}