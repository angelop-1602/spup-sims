"use client"

import { Loader2, CheckCircle2, FileText, Upload, Trash2, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { DocumentType } from "./types"

interface DocumentRowProps {
  doc: DocumentType
  isUploaded: boolean
  fileName?: string | null
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
  fileName,
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
      <span className="font-medium text-foreground">
        {doc.label}
      </span>

      <div className="flex flex-col gap-1 min-w-0">
        {isUploaded ? (
          <>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-green-200 bg-green-50 text-green-700 text-xs font-medium w-fit">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
              Attached
            </span>
            {fileName && (
              <span className="text-xs text-muted-foreground truncate max-w-55" title={fileName}>
                {fileName}
              </span>
            )}
          </>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border bg-muted text-muted-foreground text-xs font-medium w-fit">
            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
            Pending
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
              ? "border border-border text-foreground hover:text-foreground hover:bg-muted"
              : "text-muted-foreground cursor-not-allowed opacity-50"
          }`}
          title={isUploaded ? "View Document" : "No document uploaded"}
        >
          {isViewing ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
          <span className="sr-only">View</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onUploadClick(doc)}
          disabled={isUploading || isDeleting}
          className="h-8 w-8 p-0 border border-border text-foreground hover:text-foreground hover:bg-muted"
          title={isUploaded ? "Replace File" : "Upload File"}
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          <span className="sr-only">Upload</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(doc)}
          disabled={!isUploaded || !isDeletable || isDeleting || isUploading}
          className={`h-8 w-8 p-0 ${
            isUploaded && isDeletable
              ? "bg-red-100 text-red-600 hover:text-red-600 hover:bg-red-50"
              : "text-muted-foreground cursor-not-allowed opacity-50"
          }`}
          title={!isDeletable ? "Required document. Use Replace instead" : isUploaded ? "Delete Document" : "No document to delete"}
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
          <span className="sr-only">Delete</span>
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
  getDocFileName: (key: string) => string | null | undefined
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
  getDocFileName,
  onUploadClick,
  onDelete,
  onView,
}: DocumentsChecklistProps) {
  return (
    <Card className="gap-0 py-0">
      {/* Required Documents */}
      <div className="bg-muted/75 px-4 py-2 border-b border-border">
        <h2 className="text-xs font-bold tracking-wider text-muted-foreground uppercase">Required</h2>
        <p className="text-[11px] text-muted-foreground mt-0.5">Accepted file types: PDF, DOC, DOCX, JPG, PNG. Max file size: 10 MB</p>
      </div>

      <div className="divide-y divide-border text-sm">
        <div className="grid grid-cols-3 px-4 py-2 border-b border-border">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Document</span>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Attachment</span>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</span>
        </div>

        {requiredDocuments.map((doc) => (
          <DocumentRow
            key={doc.key}
            doc={doc}
            isUploaded={!!getDocUrl(doc.apiName)}
            fileName={getDocFileName(doc.apiName)}
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
      <div className="bg-muted/75 px-4 py-2 border-t border-b border-border">
        <h2 className="text-xs font-bold tracking-wider text-muted-foreground uppercase">If Applicable</h2>
        <p className="text-[11px] text-muted-foreground mt-0.5">Accepted file types: PDF, JPG, PNG. Max file size: 10 MB</p>
      </div>

      <div className="divide-y divide-border text-sm">
        <div className="grid grid-cols-3 px-4 py-2 border-b border-border">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Document</span>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Attachment</span>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</span>
        </div>

        {ifApplicableDocuments.map((doc) => (
          <DocumentRow
            key={doc.key}
            doc={doc}
            isUploaded={!!getDocUrl(doc.apiName)}
            fileName={getDocFileName(doc.apiName)}
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
    </Card>
  )
}
