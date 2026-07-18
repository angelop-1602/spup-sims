"use client"

import * as React from "react"
import { Loader2, AlertCircle, CheckCircle2, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Link from "next/link"
import { useRouter } from "next/navigation"

import type { ApplicantMePayload, ProfileUpdateForm, DocumentType, DocumentEntry, DocKind } from "@/components/profile/types"
import { REQUIRED_DOCUMENTS, IF_APPLICABLE_DOCUMENTS, getDocKind, normalizeGender, normalizeCivilStatus } from "@/components/profile/types"
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
    suffix: "",
    gender: "0",
    birthDate: "",
    civilStatus: "0",
    religion: "",
    qualifier: "",
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
      if (profileData?.profile) {
        profileData.profile = {
          ...profileData.profile,
          gender: normalizeGender(profileData.profile.gender),
          civilStatus: normalizeCivilStatus(profileData.profile.civilStatus),
        }
      }
      setData(profileData)

      if (profileData && profileData.profile) {
        setEditForm({
          firstName: profileData.profile.firstName || "",
          middleName: profileData.profile.middleName || "",
          lastName: profileData.profile.lastName || "",
          suffix: profileData.profile.suffix || "",
          gender: String(profileData.profile.gender),
          birthDate: profileData.profile.birthDate || "",
          civilStatus: String(profileData.profile.civilStatus),
          religion: profileData.profile.religion || "",
          qualifier: profileData.profile.qualifier || "",
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

    setIsSaving(true)
    try {
      const token = localStorage.getItem("access_token")
      if (!token) throw new Error("No active session found.")

      const body = {
        firstName: editForm.firstName,
        middleName: editForm.middleName || null,
        lastName: editForm.lastName,
        suffix: editForm.suffix || null,
        gender: Number(editForm.gender),
        birthDate: editForm.birthDate,
        civilStatus: Number(editForm.civilStatus),
        religion: editForm.religion || null,
        qualifier: editForm.qualifier || null,
        phoneNumber: editForm.phoneNumber || null,
        mobileNumber: editForm.mobileNumber || null,
        address: editForm.address || null,
      }

      const response = await fetch("/api/v1/applicant/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        throw new Error(`Failed to update profile. Status code: ${response.status}`)
      }

      await fetchMyProfile()

      setData((prev) => {
        if (!prev?.profile) return prev
        return {
          ...prev,
          profile: {
            ...prev.profile,
            suffix: editForm.suffix || null,
            gender: Number(editForm.gender),
            civilStatus: Number(editForm.civilStatus),
            qualifier: editForm.qualifier || null,
          }
        }
      })

      setIsEditModalOpen(false)
      setStatusModal({ open: true, type: "success", title: "Profile Updated", message: "Your personal information has been updated successfully." })
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

  const MAX_FILE_SIZE = 10 * 1024 * 1024

  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !currentUploadingDoc) return

    const allowedExts = currentUploadingDoc.accept.split(",").map((e) => e.trim().toLowerCase())
    const fileExt = "." + file.name.split(".").pop()?.toLowerCase()
    if (!allowedExts.includes(fileExt)) {
      const allowedList = allowedExts.join(", ")
      setStatusModal({ open: true, type: "error", title: "Invalid File Type", message: `"${file.name}" is not a supported file type for ${currentUploadingDoc.label}. Allowed: ${allowedList}` })
      setCurrentUploadingDoc(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setStatusModal({ open: true, type: "error", title: "Upload Failed", message: "This file is too large. Max file size is 10 MB." })
      setCurrentUploadingDoc(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
      return
    }

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
        if (response.status === 413) {
          throw new Error("This file is too large. Max file size is 10 MB.")
        }
        throw new Error(`Upload failed with status code: ${response.status}`)
      }

      await fetchMyProfile()
      await fetchDocuments()
      await saveFile(currentUploadingDoc.key, file)
      setStatusModal({ open: true, type: "success", title: "Upload Successful", message: `${currentUploadingDoc.label} has been uploaded successfully.` })
    } catch (err: any) {
      const isTooLarge = err.message === "Failed to fetch" && file.size > 10 * 1024 * 1024
      setStatusModal({
        open: true,
        type: "error",
        title: "Upload Failed",
        message: isTooLarge ? "This file is too large. Max file size is 10 MB." : (err.message || "Failed to upload document."),
      })
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

  const getDocFileName = (apiName: string): string | null | undefined => {
    return documents.find((d) => d.requirementName === apiName)?.fileName
  }

  const [viewingDocKey, setViewingDocKey] = React.useState<string | null>(null)
  const [viewDocModal, setViewDocModal] = React.useState<{ open: boolean; url: string | null; label: string; kind: DocKind }>({
    open: false, url: null, label: "", kind: "other"
  })

  const closeViewDocModal = () => {
    if (viewDocModal.url) URL.revokeObjectURL(viewDocModal.url)
    setViewDocModal({ open: false, url: null, label: "", kind: "other" })
  }

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
      let blob: Blob
      if (localFile) {
        blob = localFile
      } else {
        const response = await fetch(`/api/documents/${docEntry.storagePath}`, {
          headers: { "Authorization": `Bearer ${token}` }
        })

        if (!response.ok) {
          throw new Error("Document preview unavailable. Re-upload the file to enable preview.")
        }

        blob = await response.blob()
      }

      const kind = getDocKind(docEntry.fileName, blob.type)
      const blobUrl = URL.createObjectURL(blob)

      if (kind === "word") {
        const link = document.createElement("a")
        link.href = blobUrl
        link.download = docEntry.fileName || doc.label
        link.click()
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000)
        return
      }

      setViewDocModal({ open: true, url: blobUrl, label: doc.label, kind })
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

  React.useEffect(() => {
    if (!statusModal.open) return
    const timer = setTimeout(() => {
      setStatusModal((s) => ({ ...s, open: false }))
    }, 4500)
    return () => clearTimeout(timer)
  }, [statusModal.open])

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
    <div className="w-full space-y-6">

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
        getDocFileName={getDocFileName}
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

      {/* Document Preview Modal */}
      <Dialog open={viewDocModal.open} onOpenChange={(open) => !open && closeViewDocModal()}>
        <DialogContent
          className={
            viewDocModal.kind === "image"
              ? "flex w-fit max-w-[90vw] flex-col"
              : "flex h-[70vh] w-[95vw] max-w-6xl sm:max-w-6xl flex-col"
          }
        >
          <DialogHeader>
            <DialogTitle>{viewDocModal.label}</DialogTitle>
          </DialogHeader>
          {viewDocModal.url && viewDocModal.kind === "image" ? (
            <img
              src={viewDocModal.url}
              alt={viewDocModal.label}
              className="min-w-[320px] max-w-[85vw] max-h-[80vh] rounded-md border border-border object-contain"
            />
          ) : viewDocModal.url ? (
            <iframe
              src={`${viewDocModal.url}#view=Fit`}
              title={viewDocModal.label}
              className="w-full flex-1 rounded-md border border-border"
            />
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Status Alert (Success/Error) */}
      {statusModal.open && (
        <div className="fixed top-4 right-4 z-50 w-full max-w-sm animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="flex items-start gap-3 rounded-xl border border-border bg-popover p-4 shadow-lg ring-1 ring-foreground/10">
            {statusModal.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">{statusModal.title}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{statusModal.message}</p>
            </div>
            <button
              onClick={() => setStatusModal((s) => ({ ...s, open: false }))}
              className="shrink-0 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Dismiss</span>
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
