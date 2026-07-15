"use client"

import * as React from "react"
import { Loader2, Pencil, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { calculateAge, type ApplicantMePayload, type ProfileUpdateForm } from "./types"

interface PersonalInfoSectionProps {
  profile: ApplicantMePayload["profile"]
  isEditing: boolean
  isSaving: boolean
  editForm: ProfileUpdateForm
  setEditForm: React.Dispatch<React.SetStateAction<ProfileUpdateForm>>
  onEdit: () => void
  onCancel: () => void
  onSave: () => void
}

export function PersonalInfoSection({
  profile,
  isEditing,
  isSaving,
  editForm,
  setEditForm,
  onEdit,
  onCancel,
  onSave,
}: PersonalInfoSectionProps) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden shadow-sm">
      <div className="bg-neutral-50/75 px-4 py-2 border-b border-neutral-200 flex justify-between items-center">
        <h2 className="text-xs font-bold tracking-wider text-neutral-500 uppercase">Personal</h2>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancel}
                disabled={isSaving}
                className="h-7 text-xs px-2 text-neutral-500 hover:text-neutral-800"
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={onSave}
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
              onClick={onEdit}
              className="h-7 text-xs px-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/50"
            >
              <Pencil className="h-3.5 w-3.5 mr-1" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="divide-y divide-neutral-100 text-sm">
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

        <div className="grid grid-cols-3 px-4 py-3 items-center">
          <span className="text-neutral-500">Age</span>
          <span className="col-span-2 text-neutral-900 font-medium">
            {isEditing ? calculateAge(editForm.birthDate) : calculateAge(profile.birthDate)}
          </span>
        </div>

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

      <div className="bg-neutral-50/75 px-4 py-2 border-t border-b border-neutral-200">
        <h2 className="text-xs font-bold tracking-wider text-neutral-500 uppercase">Contact</h2>
      </div>
      <div className="divide-y divide-neutral-100 text-sm">
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
  )
}
