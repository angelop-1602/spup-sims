"use client"

import * as React from "react"
import { Loader2, AlertCircle, FileText, ArrowLeft, Upload, CheckCircle2, Pencil, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input" // Make sure this is imported to render edit textboxes
import Link from "next/link"

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
    birthDate?: string | null
    age?: number | string | null
    religion?: string | null
    personalEmail?: string | null
    phoneNumber?: string | null
    mobileNumber?: string | null
    address?: string | null
  }
}

interface ProfileUpdateForm {
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

const STATUS_STYLES: Record<string, string> = {
  Interview: "bg-blue-500/10 text-blue-600 border border-blue-500/20",
  Hired:     "bg-green-500/10 text-green-600 border border-green-500/20",
  Rejected:  "bg-red-500/10 text-red-600 border border-red-500/20",
  Pending:   "bg-yellow-500/10 text-yellow-600 border border-yellow-500/20",
  Submitted: "bg-purple-500/10 text-purple-600 border border-purple-500/20",
}

function calculateAge(birthDateString: string | null | undefined): string {
  if (!birthDateString) return "—";
  
  const birthDate = new Date(birthDateString);
  if (isNaN(birthDate.getTime())) return "—";

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age >= 0 ? age.toString() : "—";
}

export default function ApplicantSelfProfilePage() {
  const [data, setData] = React.useState<ApplicantMePayload | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  
  // Resume uploading states
  const [isUploading, setIsUploading] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Profile editing states
  const [isEditing, setIsEditing] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [editForm, setEditForm] = React.useState<ProfileUpdateForm>({
    firstName: "",
    middleName: "",
    lastName: "",
    birthDate: "",
    religion: "",
    personalEmail: "",
    phoneNumber: "",
    mobileNumber: "",
    address: ""
  })

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
      const profileData = payload?.data || payload
      setData(profileData)

      // Initialize edit form values with fetched profile data
      if (profileData && profileData.profile) {
        setEditForm({
          firstName: profileData.profile.firstName || "",
          middleName: profileData.profile.middleName || "",
          lastName: profileData.profile.lastName || "",
          birthDate: profileData.profile.birthDate || "",
          religion: profileData.profile.religion || "",
          personalEmail: profileData.profile.personalEmail || "",
          phoneNumber: profileData.profile.phoneNumber || "",
          mobileNumber: profileData.profile.mobileNumber || "",
          address: profileData.profile.address || ""
        })
      }

    } catch (err: any) {
      setError(err.message || "Failed to retrieve your applicant profile.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Save profile handler
  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      const token = localStorage.getItem("access_token")
      if (!token) {
        throw new Error("No active session found.")
      }

      // Send the updated details to the profile endpoint
      const response = await fetch("/api/v1/applicant/profile", {
        method: "PUT", 
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      })

      if (!response.ok) {
        throw new Error(`Failed to update profile. Status code: ${response.status}`)
      }

      // Refresh data and exit edit mode on success
      await fetchMyProfile()
      setIsEditing(false)
      alert("Profile updated successfully!")

    } catch (err: any) {
      alert(err.message || "An error occurred while saving profile.")
    } finally {
      setIsSaving(false)
    }
  }

  // Handle resume uploading (TBU)
  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const token = localStorage.getItem("access_token")
      if (!token) {
        throw new Error("You must be logged in to upload files.")
      }

      const formData = new FormData()
      formData.append("file", file) 

      const response = await fetch("/api/v1/applicant/documents/resume", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error(`Upload failed with status code: ${response.status}`)
      }

      await fetchMyProfile()
      alert("Resume uploaded successfully!")

    } catch (err: any) {
      alert(err.message || "Failed to upload resume.")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const triggerFileSelection = () => {
    fileInputRef.current?.click()
  }

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
      
      {/* Hidden file input for resume uploads */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleResumeUpload} 
        accept=".pdf,.doc,.docx" 
        className="hidden" 
      />

      {/* Back to Dashboard Button */}
      <div className="flex items-center">
        <Link 
          href="/applicant/dashboard" 
          className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 transition-colors font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

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

        <div className="flex flex-wrap items-center gap-2">
          
          {data.resumeUrl && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-green-200 bg-green-50 text-green-700 text-xs font-medium">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Resume Attached
            </div>
          )}

          {data.resumeUrl && (
            <Button 
              variant="outline" 
              asChild
              className="text-sm font-normal text-neutral-600 bg-white border-neutral-200 shadow-none hover:bg-neutral-50"
            >
              <a href={data.resumeUrl} target="_blank" rel="noopener noreferrer">
                <FileText className="mr-2 h-4 w-4 text-neutral-400" />
                View resume
              </a>
            </Button>
          )}

          <Button 
            variant={data.resumeUrl ? "ghost" : "outline"} 
            onClick={triggerFileSelection}
            disabled={isUploading}
            className="text-sm font-normal text-neutral-600 border-neutral-200 shadow-none hover:bg-neutral-50"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin text-neutral-400" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4 text-neutral-400" />
                {data.resumeUrl ? "Update file" : "Attach resume"}
              </>
            )}
          </Button>

        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden shadow-sm">
        {/* Profile Section */}
        <div className="bg-neutral-50/75 px-4 py-2 border-b border-neutral-200 flex justify-between items-center">
          <h2 className="text-xs font-bold tracking-wider text-neutral-500 uppercase">Personal</h2>
          
          {/* Edit/Save Changes */}
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                  className="h-7 text-xs px-2 text-neutral-500 hover:text-neutral-800"
                >
                  <X className="h-3.5 w-3.5 mr-1" />
                  Cancel
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="h-7 text-xs px-2.5 bg-neutral-900 hover:bg-neutral-800 text-white"
                >
                  {isSaving ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  ) : (
                    <Save className="h-3.5 w-3.5 mr-1" />
                  )}
                  Save details
                </Button>
              </>
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsEditing(true)}
                className="h-7 text-xs px-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/50"
              >
                <Pencil className="h-3.5 w-3.5 mr-1" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        <div className="divide-y divide-neutral-100 text-sm">
          {/* First Name Row */}
          <div className="grid grid-cols-3 px-4 py-3 items-center">
            <span className="text-neutral-500">First Name</span>
            <span className="col-span-2 font-medium text-neutral-900">
              {isEditing ? (
                <Input 
                  value={editForm.firstName} 
                  onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                  className="h-9 max-w-sm"
                />
              ) : (
                profile.firstName || "—"
              )}
            </span>
          </div>

          {/* Middle Name Row */}
          <div className="grid grid-cols-3 px-4 py-3 items-center">
            <span className="text-neutral-500">Middle Name</span>
            <span className="col-span-2 text-neutral-900">
              {isEditing ? (
                <Input 
                  value={editForm.middleName} 
                  onChange={(e) => setEditForm({ ...editForm, middleName: e.target.value })}
                  className="h-9 max-w-sm"
                />
              ) : (
                profile.middleName || "—"
              )}
            </span>
          </div>

          {/* Last Name Row */}
          <div className="grid grid-cols-3 px-4 py-3 items-center">
            <span className="text-neutral-500">Last Name</span>
            <span className="col-span-2 font-medium text-neutral-900">
              {isEditing ? (
                <Input 
                  value={editForm.lastName} 
                  onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                  className="h-9 max-w-sm"
                />
              ) : (
                profile.lastName || "—"
              )}
            </span>
          </div>

          {/* Date of Birth Row */}
          <div className="grid grid-cols-3 px-4 py-3 items-center">
            <span className="text-neutral-500">Date of Birth</span>
            <span className="col-span-2 text-neutral-900">
              {isEditing ? (
                <Input 
                  type="date"
                  value={editForm.birthDate} 
                  onChange={(e) => setEditForm({ ...editForm, birthDate: e.target.value })}
                  className="h-9 max-w-sm"
                />
              ) : (
                profile.birthDate || "—"
              )}
            </span>
          </div>

          {/* Age Row */}
          <div className="grid grid-cols-3 px-4 py-3 items-center">
            <span className="text-neutral-500">Age</span>
            <span className="col-span-2 text-neutral-900 font-medium">
              {isEditing ? (
                calculateAge(editForm.birthDate)
              ) : (
                calculateAge(profile.birthDate)
              )}
            </span>
          </div>

          {/* Religion Row */}
          <div className="grid grid-cols-3 px-4 py-3 items-center">
            <span className="text-neutral-500">Religion</span>
            <span className="col-span-2 text-neutral-900">
              {isEditing ? (
                <Input 
                  value={editForm.religion} 
                  onChange={(e) => setEditForm({ ...editForm, religion: e.target.value })}
                  className="h-9 max-w-sm"
                />
              ) : (
                profile.religion || "—"
              )}
            </span>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-neutral-50/75 px-4 py-2 border-t border-b border-neutral-200">
          <h2 className="text-xs font-bold tracking-wider text-neutral-500 uppercase">Contact</h2>
        </div>
        <div className="divide-y divide-neutral-100 text-sm">
          {/* Personal Email Row */}
          <div className="grid grid-cols-3 px-4 py-3 items-center">
            <span className="text-neutral-500">Email</span>
            <span className="col-span-2 font-medium text-neutral-900">
              {isEditing ? (
                <Input 
                  type="email"
                  value={editForm.personalEmail} 
                  onChange={(e) => setEditForm({ ...editForm, personalEmail: e.target.value })}
                  className="h-9 max-w-sm"
                />
              ) : (
                profile.personalEmail || "—"
              )}
            </span>
          </div>

          {/* Phone Row */}
          <div className="grid grid-cols-3 px-4 py-3 items-center">
            <span className="text-neutral-500">Phone</span>
            <span className="col-span-2 text-neutral-900">
              {isEditing ? (
                <Input 
                  value={editForm.phoneNumber} 
                  onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                  className="h-9 max-w-sm"
                />
              ) : (
                profile.phoneNumber || "—"
              )}
            </span>
          </div>

          {/* Mobile Row */}
          <div className="grid grid-cols-3 px-4 py-3 items-center">
            <span className="text-neutral-500">Mobile</span>
            <span className="col-span-2 text-neutral-900">
              {isEditing ? (
                <Input 
                  value={editForm.mobileNumber} 
                  onChange={(e) => setEditForm({ ...editForm, mobileNumber: e.target.value })}
                  className="h-9 max-w-sm"
                />
              ) : (
                profile.mobileNumber || "—"
              )}
            </span>
          </div>

          {/* Address Row */}
          <div className="grid grid-cols-3 px-4 py-3 items-center">
            <span className="text-neutral-500">Address</span>
            <span className="col-span-2 text-neutral-900">
              {isEditing ? (
                <Input 
                  value={editForm.address} 
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="h-9 max-w-sm"
                />
              ) : (
                profile.address || "—"
              )}
            </span>
          </div>
        </div>

      </div>
    </div>
  )
}