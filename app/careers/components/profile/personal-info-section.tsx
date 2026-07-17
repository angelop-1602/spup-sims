"use client"

import { PenLine } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { calculateAge, type ApplicantMePayload } from "./types"

interface PersonalInfoSectionProps {
  profile: ApplicantMePayload["profile"]
  onEdit: () => void
}

export function PersonalInfoSection({ profile, onEdit }: PersonalInfoSectionProps) {
  return (
    <Card className="gap-0 py-0">
      <div className="bg-muted/75 px-4 py-2 border-b border-border flex justify-between items-center">
        <h2 className="text-xs font-bold tracking-wider text-muted-foreground uppercase">Personal</h2>

        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="h-7 text-xs px-2 text-foreground border border-border hover:text-foreground hover:bg-muted/50"
        >
          <PenLine className="h-3 w-3 mr-1" />
          Edit
        </Button>
      </div>

      <div className="divide-y divide-border text-sm">
        <div className="grid grid-cols-3 px-4 py-3 items-center">
          <span className="text-muted-foreground">First Name</span>
          <span className="col-span-2 text-foreground">{profile.firstName || "—"}</span>
        </div>

        <div className="grid grid-cols-3 px-4 py-3 items-center">
          <span className="text-muted-foreground">Middle Name</span>
          <span className="col-span-2 text-foreground">{profile.middleName || "—"}</span>
        </div>

        <div className="grid grid-cols-3 px-4 py-3 items-center">
          <span className="text-muted-foreground">Last Name</span>
          <span className="col-span-2 text-foreground">{profile.lastName || "—"}</span>
        </div>

        <div className="grid grid-cols-3 px-4 py-3 items-center">
          <span className="text-muted-foreground">Date of Birth</span>
          <span className="col-span-2 text-foreground">{profile.birthDate || "—"}</span>
        </div>

        <div className="grid grid-cols-3 px-4 py-3 items-center">
          <span className="text-muted-foreground">Age</span>
          <span className="col-span-2 text-foreground">{calculateAge(profile.birthDate)}</span>
        </div>

        <div className="grid grid-cols-3 px-4 py-3 items-center">
          <span className="text-muted-foreground">Religion</span>
          <span className="col-span-2 text-foreground">{profile.religion || "—"}</span>
        </div>
      </div>

      <div className="bg-muted/75 px-4 py-2 border-t border-b border-border">
        <h2 className="text-xs font-bold tracking-wider text-muted-foreground uppercase">Contact</h2>
      </div>
      <div className="divide-y divide-border text-sm">
        <div className="grid grid-cols-3 px-4 py-3 items-center">
          <span className="text-muted-foreground">Email</span>
          <span className="col-span-2 text-foreground">{profile.personalEmail || "—"}</span>
        </div>

        <div className="grid grid-cols-3 px-4 py-3 items-center">
          <span className="text-muted-foreground">Phone</span>
          <span className="col-span-2 text-foreground">{profile.phoneNumber || "—"}</span>
        </div>

        <div className="grid grid-cols-3 px-4 py-3 items-center">
          <span className="text-muted-foreground">Mobile</span>
          <span className="col-span-2 text-foreground">{profile.mobileNumber || "—"}</span>
        </div>

        <div className="grid grid-cols-3 px-4 py-3 items-center">
          <span className="text-muted-foreground">Address</span>
          <span className="col-span-2 text-foreground">{profile.address || "—"}</span>
        </div>
      </div>
    </Card>
  )
}
