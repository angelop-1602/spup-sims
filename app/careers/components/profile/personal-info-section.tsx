"use client"

import { Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { calculateAge, type ApplicantMePayload } from "./types"

interface PersonalInfoSectionProps {
  profile: ApplicantMePayload["profile"]
  onEdit: () => void
}

export function PersonalInfoSection({ profile, onEdit }: PersonalInfoSectionProps) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden shadow-sm">
      <div className="bg-neutral-50/75 px-4 py-2 border-b border-neutral-200 flex justify-between items-center">
        <h2 className="text-xs font-bold tracking-wider text-neutral-500 uppercase">Personal</h2>

        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="h-7 text-xs px-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/50"
        >
          <Pencil className="h-3.5 w-3.5 mr-1" />
          Edit Profile
        </Button>
      </div>

      <div className="divide-y divide-neutral-100 text-sm">
        <div className="grid grid-cols-3 px-4 py-3 items-center">
          <span className="text-neutral-500">First Name</span>
          <span className="col-span-2 font-medium text-neutral-900">{profile.firstName || "—"}</span>
        </div>

        <div className="grid grid-cols-3 px-4 py-3 items-center">
          <span className="text-neutral-500">Middle Name</span>
          <span className="col-span-2 text-neutral-900">{profile.middleName || "—"}</span>
        </div>

        <div className="grid grid-cols-3 px-4 py-3 items-center">
          <span className="text-neutral-500">Last Name</span>
          <span className="col-span-2 font-medium text-neutral-900">{profile.lastName || "—"}</span>
        </div>

        <div className="grid grid-cols-3 px-4 py-3 items-center">
          <span className="text-neutral-500">Date of Birth</span>
          <span className="col-span-2 text-neutral-900">{profile.birthDate || "—"}</span>
        </div>

        <div className="grid grid-cols-3 px-4 py-3 items-center">
          <span className="text-neutral-500">Age</span>
          <span className="col-span-2 text-neutral-900 font-medium">{calculateAge(profile.birthDate)}</span>
        </div>

        <div className="grid grid-cols-3 px-4 py-3 items-center">
          <span className="text-neutral-500">Religion</span>
          <span className="col-span-2 text-neutral-900">{profile.religion || "—"}</span>
        </div>
      </div>

      <div className="bg-neutral-50/75 px-4 py-2 border-t border-b border-neutral-200">
        <h2 className="text-xs font-bold tracking-wider text-neutral-500 uppercase">Contact</h2>
      </div>
      <div className="divide-y divide-neutral-100 text-sm">
        <div className="grid grid-cols-3 px-4 py-3 items-center">
          <span className="text-neutral-500">Email</span>
          <span className="col-span-2 font-medium text-neutral-900">{profile.personalEmail || "—"}</span>
        </div>

        <div className="grid grid-cols-3 px-4 py-3 items-center">
          <span className="text-neutral-500">Phone</span>
          <span className="col-span-2 text-neutral-900">{profile.phoneNumber || "—"}</span>
        </div>

        <div className="grid grid-cols-3 px-4 py-3 items-center">
          <span className="text-neutral-500">Mobile</span>
          <span className="col-span-2 text-neutral-900">{profile.mobileNumber || "—"}</span>
        </div>

        <div className="grid grid-cols-3 px-4 py-3 items-center">
          <span className="text-neutral-500">Address</span>
          <span className="col-span-2 text-neutral-900">{profile.address || "—"}</span>
        </div>
      </div>
    </div>
  )
}
