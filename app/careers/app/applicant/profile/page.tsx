"use client"

import * as React from "react"
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

import type { ApplicantMePayload, ProfileUpdateForm, DocumentType } from "@/components/profile/types"
import { REQUIRED_DOCUMENTS, IF_APPLICABLE_DOCUMENTS } from "@/components/profile/types"
import { ProfileBanner } from "@/components/profile/profile-banner"
import { PersonalInfoSection } from "@/components/profile/personal-info-section"
import { EditProfileModal } from "@/components/profile/edit-profile-modal"
import { DocumentsChecklist } from "@/components/profile/documents-checklist"

export default function ApplicantSelfProfilePage() {
  const [data, setData] = React.useState<ApplicantMePayload | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // Document interaction states
  const [activeUploadKey, setActiveUploadKey] = React.useState<string | null>(null)
  const [activeDeleteKey, setActiveDeleteKey] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [currentUploadingDoc, setCurrentUploadingDoc] = React.useState<DocumentType | null>(null)

  // Profile editing states
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false)
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

  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      const token = localStorage.getItem("access_token")
      if (!token) throw new Error("No active session found.")

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

      await fetchMyProfile()
      setIsEditModalOpen(false)
      alert("Profile updated successfully!")
    } catch (err: any) {
      alert(err.message || "An error occurred while saving profile.")
    } finally {
      setIsSaving(false)
    }
  }

  const triggerFileSelection = (doc: DocumentType) => {
    setCurrentUploadingDoc(doc)
    fileInputRef.current?.click()
  }

  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !currentUploadingDoc) return

    setActiveUploadKey(currentUploadingDoc.key)
    try {
      const token = localStorage.getItem("access_token")
      if (!token) throw new Error("You must be logged in to upload files.")

      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch(currentUploadingDoc.endpoint, {
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
      alert(`${currentUploadingDoc.label} uploaded successfully!`)
    } catch (err: any) {
      alert(err.message || "Failed to upload document.")
    } finally {
      setActiveUploadKey(null)
      setCurrentUploadingDoc(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleDocumentDelete = async (doc: DocumentType) => {
    if (!confirm(`Are you sure you want to delete your uploaded ${doc.label}?`)) return

    setActiveDeleteKey(doc.key)
    try {
      const token = localStorage.getItem("access_token")
      if (!token) throw new Error("No session found.")

      const response = await fetch(doc.endpoint, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error(`Delete failed with status code: ${response.status}`)
      }

      await fetchMyProfile()
      alert(`${doc.label} deleted successfully!`)
    } catch (err: any) {
      alert(err.message || "Failed to delete document.")
    } finally {
      setActiveDeleteKey(null)
    }
  }

  const getDocUrl = (key: string): string | null | undefined => {
    switch (key) {
      case "resume": return data?.resumeUrl
      default: return null
    }
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
        <div className="flex items-center gap-2 mt-1">
          <Button variant="outline" size="sm" onClick={fetchMyProfile}>
            Retry
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Back to Login</Link>
          </Button>
        </div>
      </div>
    )
  }

  const { profile } = data

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 bg-neutral-50/30 min-h-screen">

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleDocumentUpload}
        accept=".pdf,.doc,.docx"
        className="hidden"
      />

      <div className="flex items-center">
        <Link
          href="/applicant/dashboard"
          className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 transition-colors font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      <ProfileBanner
        profile={profile}
        status={data.status}
        createdAt={data.createdAt}
      />

      <PersonalInfoSection
        profile={profile}
        onEdit={() => setIsEditModalOpen(true)}
      />

      <EditProfileModal
        open={isEditModalOpen}
        isSaving={isSaving}
        editForm={editForm}
        setEditForm={setEditForm}
        onCancel={() => setIsEditModalOpen(false)}
        onSave={handleSaveProfile}
      />

      <DocumentsChecklist
        requiredDocuments={REQUIRED_DOCUMENTS}
        ifApplicableDocuments={IF_APPLICABLE_DOCUMENTS}
        activeUploadKey={activeUploadKey}
        activeDeleteKey={activeDeleteKey}
        getDocUrl={getDocUrl}
        onUploadClick={triggerFileSelection}
        onDelete={handleDocumentDelete}
      />

    </div>
  )
}
