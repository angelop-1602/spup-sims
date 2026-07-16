"use client"

import { Loader2, CheckCircle2, FileText, Upload, Trash2, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { DocumentType } from "./types"

interface DocumentRowProps {
  doc: DocumentType
  isUploaded: boolean
  isUploading: boolean
  isDeleting: boolean
  isViewing: boolean
  isDeletable: boolean
  onUploadClick: (doc: DocumentType) => void
  onDelete: (doc: DocumentType) => void
  onView: (doc: DocumentType) => void
}

function DocumentRow({
  doc,
  isUploaded,
  isUploading,
  isDeleting,
  isViewing,
  isDeletable,
  onUploadClick,
  onDelete,
  onView,
}: DocumentRowProps) {
  return (
    <div className="grid grid-cols-3 px-4 py-3 items-center">
      <span className="font-medium text-neutral-900">
        {doc.label}
      </span>

      <div className="flex items-center">
        {isUploaded ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-green-200 bg-green-50 text-green-700 text-xs font-medium">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
            Attached
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-neutral-200 bg-neutral-50 text-neutral-400 text-xs font-medium">
            <FileText className="h-3.5 w-3.5 text-neutral-300" />
            Missing
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onView(doc)}
          disabled={!isUploaded || isDeleting || isUploading || isViewing}
          className={`h-8 w-8 p-0 ${
            isUploaded
              ? "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100"
              : "text-neutral-300 cursor-not-allowed opacity-50"
          }`}
          title={isUploaded ? "View Document" : "No document uploaded"}
        >
          {isViewing ? (
            <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
          <span className="sr-only">View</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(doc)}
          disabled={!isUploaded || !isDeletable || isDeleting || isUploading}
          className={`h-8 w-8 p-0 ${
            isUploaded && isDeletable
              ? "text-red-400 hover:text-red-600 hover:bg-red-50" 
              : "text-neutral-300 cursor-not-allowed opacity-50"
          }`}
          title={!isDeletable ? "Required document — use Replace instead" : isUploaded ? "Delete Document" : "No document to delete"}
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
          <span className="sr-only">Delete</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onUploadClick(doc)}
          disabled={isUploading || isDeleting}
          className="h-8 w-8 p-0 text-neutral-500 border-1 border-gray hover:text-neutral-800 hover:bg-neutral-100"
          title={isUploaded ? "Replace File" : "Upload File"}
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          <span className="sr-only">Upload</span>
        </Button>

      </div>
    </div>
  )
}

interface DocumentsChecklistProps {
  requiredDocuments: DocumentType[]
  ifApplicableDocuments: DocumentType[]
  activeUploadKey: string | null
  activeDeleteKey: string | null
  viewingDocKey: string | null
  getDocUrl: (key: string) => string | null | undefined
  onUploadClick: (doc: DocumentType) => void
  onDelete: (doc: DocumentType) => void
  onView: (doc: DocumentType) => void
}

export function DocumentsChecklist({
  requiredDocuments,
  ifApplicableDocuments,
  activeUploadKey,
  activeDeleteKey,
  viewingDocKey,
  getDocUrl,
  onUploadClick,
  onDelete,
  onView,
}: DocumentsChecklistProps) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden shadow-sm">
      {/* Required Documents */}
      <div className="bg-neutral-50/75 px-4 py-2 border-b border-neutral-200">
        <h2 className="text-xs font-bold tracking-wider text-neutral-500 uppercase">Required</h2>
      </div>

      <div className="divide-y divide-neutral-100 text-sm">
        <div className="grid grid-cols-3 px-4 py-2 border-b border-neutral-100">
          <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Document</span>
          <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Attachment</span>
          <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Actions</span>
        </div>

        {requiredDocuments.map((doc) => (
          <DocumentRow
            key={doc.key}
            doc={doc}
            isUploaded={!!getDocUrl(doc.apiName)}
            isUploading={activeUploadKey === doc.key}
            isDeleting={activeDeleteKey === doc.key}
            isViewing={viewingDocKey === doc.key}
            isDeletable={false}
            onUploadClick={onUploadClick}
            onDelete={onDelete}
            onView={onView}
          />
        ))}
      </div>

      {/* If Applicable Documents */}
      <div className="bg-neutral-50/75 px-4 py-2 border-t border-b border-neutral-200">
        <h2 className="text-xs font-bold tracking-wider text-neutral-500 uppercase">If Applicable</h2>
      </div>

      <div className="divide-y divide-neutral-100 text-sm">
        <div className="grid grid-cols-3 px-4 py-2 border-b border-neutral-100">
          <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Document</span>
          <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Attachment</span>
          <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Actions</span>
        </div>

        {ifApplicableDocuments.map((doc) => (
          <DocumentRow
            key={doc.key}
            doc={doc}
            isUploaded={!!getDocUrl(doc.apiName)}
            isUploading={activeUploadKey === doc.key}
            isDeleting={activeDeleteKey === doc.key}
            isViewing={viewingDocKey === doc.key}
            isDeletable={true}
            onUploadClick={onUploadClick}
            onDelete={onDelete}
            onView={onView}
          />
        ))}
      </div>
    </div>
  )
}
