"use client"

import * as React from "react"
import { Loader2, X, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { calculateAge, type ProfileUpdateForm } from "./types"

interface EditProfileModalProps {
  open: boolean
  isSaving: boolean
  saveStatus: { type: "success" | "error"; message: string } | null
  editForm: ProfileUpdateForm
  setEditForm: React.Dispatch<React.SetStateAction<ProfileUpdateForm>>
  onCancel: () => void
  onSave: () => void
}

export function EditProfileModal({
  open,
  isSaving,
  saveStatus,
  editForm,
  setEditForm,
  onCancel,
  onSave,
}: EditProfileModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />

      <div className="relative z-10 w-full max-w-2xl mx-4 rounded-xl border border-neutral-200 bg-white shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-200">
          <h2 className="text-sm font-semibold text-neutral-900">Edit Profile</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isSaving}
            className="h-7 w-7 p-0 text-neutral-400 hover:text-neutral-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="px-5 py-4 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <FormField
              label="First Name"
              required
              value={editForm.firstName}
              onChange={(v) => setEditForm({ ...editForm, firstName: v })}
              hasError={saveStatus?.type === "error" && saveStatus.message.includes("First Name")}
            />
            <FormField
              label="Middle Name"
              value={editForm.middleName}
              onChange={(v) => setEditForm({ ...editForm, middleName: v })}
            />
            <FormField
              label="Last Name"
              required
              value={editForm.lastName}
              onChange={(v) => setEditForm({ ...editForm, lastName: v })}
              hasError={saveStatus?.type === "error" && saveStatus.message.includes("Last Name")}
            />
            <FormField
              label="Date of Birth"
              type="date"
              value={editForm.birthDate}
              onChange={(v) => setEditForm({ ...editForm, birthDate: v })}
            />
            <div className="space-y-1.5">
              <Label className="text-xs text-neutral-500">Age</Label>
              <p className="h-9 flex items-center text-sm font-medium text-neutral-900 px-3">
                {calculateAge(editForm.birthDate)}
              </p>
            </div>
            <FormField
              label="Religion"
              value={editForm.religion}
              onChange={(v) => setEditForm({ ...editForm, religion: v })}
            />
            <FormField
              label="Email"
              type="email"
              required
              value={editForm.personalEmail}
              onChange={(v) => setEditForm({ ...editForm, personalEmail: v })}
              hasError={saveStatus?.type === "error" && saveStatus.message.includes("Email")}
            />
            <FormField
              label="Phone"
              value={editForm.phoneNumber}
              onChange={(v) => setEditForm({ ...editForm, phoneNumber: v })}
            />
            <FormField
              label="Mobile"
              value={editForm.mobileNumber}
              onChange={(v) => setEditForm({ ...editForm, mobileNumber: v })}
            />
            <FormField
              label="Address"
              value={editForm.address}
              onChange={(v) => setEditForm({ ...editForm, address: v })}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-neutral-200 bg-neutral-50/50">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isSaving}
            className="h-8 text-xs px-4 border-neutral-200 text-neutral-700 hover:bg-neutral-100"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={onSave}
            disabled={isSaving}
            className="h-8 text-xs px-4 bg-neutral-900 hover:bg-neutral-800 text-white"
          >
            {isSaving && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
            Save Changes
          </Button>
        </div>

        {saveStatus && (
          <div
            className={`flex items-center gap-2 px-5 py-2.5 text-xs font-medium ${
              saveStatus.type === "success"
                ? "bg-green-50 text-green-700 border-t border-green-200"
                : "bg-red-50 text-red-700 border-t border-red-200"
            }`}
          >
            {saveStatus.type === "success" ? (
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            )}
            {saveStatus.message}
          </div>
        )}
      </div>
    </div>
  )
}

function FormField({
  label,
  type = "text",
  required = false,
  value,
  onChange,
  hasError = false,
}: {
  label: string
  type?: string
  required?: boolean
  value: string
  onChange: (value: string) => void
  hasError?: boolean
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-neutral-500">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`h-9 text-sm ${hasError ? "border-red-400 focus-visible:ring-red-200" : ""}`}
      />
    </div>
  )
}
