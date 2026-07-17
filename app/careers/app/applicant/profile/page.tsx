"use client"

import * as React from "react"
import { Loader2, AlertCircle, ArrowLeft, CheckCircle2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import Link from "next/link"
import { useRouter } from "next/navigation"

import type { ApplicantMePayload, ProfileUpdateForm, DocumentType, DocumentEntry } from "@/components/profile/types"
import { REQUIRED_DOCUMENTS, IF_APPLICABLE_DOCUMENTS } from "@/components/profile/types"
import { ProfileBanner } from "@/components/profile/profile-banner"
import { PersonalInfoSection } from "@/components/profile/personal-info-section"
import { EditProfileModal } from "@/components/profile/edit-profile-modal"
import { DocumentsChecklist } from "@/components/profile/documents-checklist"
import { saveFile, getFile, deleteFile } from "@/lib/file-store"

export default function ApplicantSelfProfilePage() {
  const router = useRouter()
  const [data, setData] = React.useState<ApplicantMePayload | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // Document interaction states
  const [documents, setDocuments] = React.useState<DocumentEntry[]>([])
  const [activeUploadKey, setActiveUploadKey] = React.useState<string | null>(null)
  const [activeDeleteKey, setActiveDeleteKey] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [currentUploadingDoc, setCurrentUploadingDoc] = React.useState<DocumentType | null>(null)

  // Status modal state (for success/error feedback)
  const [statusModal, setStatusModal] = React.useState<{ open: boolean; type: "success" | "error"; title: string; message: string }>({
    open: false, type: "success", title: "", message: ""
  })

  // Delete confirmation dialog state
  const [deleteConfirm, setDeleteConfirm] = React.useState<{ open: boolean; doc: DocumentType | null }>({
    open: false, doc: null
  })

  // Profile editing states
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [saveStatus, setSaveStatus] = React.useState<{ type: "success" | "error"; message: string } | null>(null)
  const [editForm, setEditFormRaw] = React.useState<ProfileUpdateForm>({
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

  const setEditForm: typeof setEditFormRaw = (args) => {
    setSaveStatus(null)
    setEditFormRaw(args)
  }

  const fetchMyProfile = React.useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem("access_token")

      if (!token) {
        router.push("/login?returnTo=/applicant/profile")
        return
      }

      const response = await fetch("/api/v1/applicant/me", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      })

      if (response.status === 401) {
        router.push("/login?returnTo=/applicant/profile")
        return
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
  }, [router])

  const fetchDocuments = React.useCallback(async () => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) return

      const response = await fetch("/api/v1/applicant/documents", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      })

      if (!response.ok) {
        console.warn(`Failed to fetch documents: ${response.status}`)
        return
      }

      const payload = await response.json()

      const entries = payload?.data ?? payload?.documents ?? payload

      if (Array.isArray(entries)) {
        setDocuments(entries)
      }
    } catch (err) {
      console.warn("Error fetching documents:", err)
    }
  }, [])

  const handleSaveProfile = async () => {
    setSaveStatus(null)

    const requiredFields: { key: keyof ProfileUpdateForm; label: string }[] = [
      { key: "firstName", label: "First Name" },
      { key: "lastName", label: "Last Name" },
      { key: "personalEmail", label: "Email" },
    ]

    const missing = requiredFields.filter((f) => !editForm[f.key].trim())
    if (missing.length > 0) {
      const names = missing.map((f) => f.label).join(", ")
      setSaveStatus({ type: "error", message: `${names} ${missing.length > 1 ? "are" : "is"} required.` })
      return
    }

    const phoneDigits = editForm.phoneNumber.replace(/\D/g, "").replace(/^63/, "")
    if (editForm.phoneNumber && phoneDigits.length !== 9) {
      setSaveStatus({ type: "error", message: "Phone number is incomplete." })
      return
    }

    const mobileDigits = editForm.mobileNumber.replace(/\D/g, "").replace(/^63/, "")
    if (editForm.mobileNumber && mobileDigits.length !== 10) {
      setSaveStatus({ type: "error", message: "Mobile number is incomplete." })
      return
    }

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
    } catch (err: any) {
      setSaveStatus({ type: "error", message: err.message || "An error occurred while saving profile." })
    } finally {
      setIsSaving(false)
    }
  }

  const triggerFileSelection = (doc: DocumentType) => {
    setCurrentUploadingDoc(doc)
    if (fileInputRef.current) {
      fileInputRef.current.accept = doc.accept
    }
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
      await fetchDocuments()
      await saveFile(currentUploadingDoc.key, file)
      setStatusModal({ open: true, type: "success", title: "Upload Successful", message: `${currentUploadingDoc.label} has been uploaded successfully.` })
    } catch (err: any) {
      setStatusModal({ open: true, type: "error", title: "Upload Failed", message: err.message || "Failed to upload document." })
    } finally {
      setActiveUploadKey(null)
      setCurrentUploadingDoc(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleDocumentDelete = async (doc: DocumentType) => {
    setDeleteConfirm({ open: true, doc })
  }

  const confirmDelete = async () => {
    const doc = deleteConfirm.doc
    if (!doc) return
    setDeleteConfirm({ open: false, doc: null })

    setActiveDeleteKey(doc.key)
    try {
      const token = localStorage.getItem("access_token")
      if (!token) throw new Error("No session found.")

      const response = await fetch(`/api/v1/applicant/documents/${doc.apiName}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error(`Delete failed with status code: ${response.status}`)
      }

      await fetchMyProfile()
      await fetchDocuments()
      await deleteFile(doc.key)
      setStatusModal({ open: true, type: "success", title: "Delete Successful", message: `${doc.label} has been deleted successfully.` })
    } catch (err: any) {
      setStatusModal({ open: true, type: "error", title: "Delete Failed", message: err.message || "Failed to delete document." })
    } finally {
      setActiveDeleteKey(null)
    }
  }

  const getDocUrl = (apiName: string): string | null | undefined => {
    const doc = documents.find((d) => d.requirementName === apiName)
    return doc?.storagePath ? `/api/documents/${doc.storagePath}` : null
  }

  const [viewingDocKey, setViewingDocKey] = React.useState<string | null>(null)

  const handleViewDocument = async (doc: DocumentType) => {
    const docEntry = documents.find((d) => d.requirementName === doc.apiName)
    if (!docEntry) return

    const token = localStorage.getItem("access_token")
    if (!token) {
      router.push("/login?returnTo=/applicant/profile")
      return
    }

    setViewingDocKey(doc.key)
    try {
      const localFile = await getFile(doc.key)
      if (localFile) {
        const blobUrl = URL.createObjectURL(localFile)
        window.open(blobUrl, "_blank")
        setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000)
        return
      }

      const response = await fetch(`/api/documents/${docEntry.storagePath}`, {
        headers: { "Authorization": `Bearer ${token}` }
      })

      if (!response.ok) {
        throw new Error("Document preview unavailable. Re-upload the file to enable preview.")
      }

      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
      window.open(blobUrl, "_blank")
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000)
    } catch (err: any) {
      setStatusModal({ open: true, type: "error", title: "View Failed", message: err.message || "Failed to open document." })
    } finally {
      setViewingDocKey(null)
    }
  }

  React.useEffect(() => {
    fetchMyProfile()
    fetchDocuments()
  }, [fetchMyProfile, fetchDocuments])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <p>Retrieving your profile details...</p>
      </div>
    )
  }

  if (error || !data || !data.profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] gap-3 p-4 text-center max-w-sm mx-auto">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="text-sm font-medium text-foreground">Unable to load profile</p>
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
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 bg-muted/30 min-h-screen">

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleDocumentUpload}
        className="hidden"
      />

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
        saveStatus={saveStatus}
        editForm={editForm}
        setEditForm={setEditForm}
        onCancel={() => { setIsEditModalOpen(false); setSaveStatus(null) }}
        onSave={handleSaveProfile}
      />

      <DocumentsChecklist
        requiredDocuments={REQUIRED_DOCUMENTS}
        ifApplicableDocuments={IF_APPLICABLE_DOCUMENTS}
        activeUploadKey={activeUploadKey}
        activeDeleteKey={activeDeleteKey}
        viewingDocKey={viewingDocKey}
        getDocUrl={getDocUrl}
        onUploadClick={triggerFileSelection}
        onDelete={handleDocumentDelete}
        onView={handleViewDocument}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirm.open} onOpenChange={(open) => !open && setDeleteConfirm({ open: false, doc: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Delete Document
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete your uploaded <strong>{deleteConfirm.doc?.label}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Status Modal (Success/Error) */}
      <Dialog open={statusModal.open} onOpenChange={(open) => !open && setStatusModal((s) => ({ ...s, open: false }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {statusModal.type === "success" ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-destructive" />
              )}
              {statusModal.title}
            </DialogTitle>
            <DialogDescription>
              {statusModal.message}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setStatusModal((s) => ({ ...s, open: false }))}>
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
