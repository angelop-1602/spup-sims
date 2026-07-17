"use client"

import * as React from "react"
import { CalendarIcon, AlertCircle, Loader2 } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
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
  return (
    <Dialog open={open} onOpenChange={(next) => !next && !isSaving && onCancel()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>Update your personal information below.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-x-4 gap-y-5">
          <FormField
            label="First Name"
            required
            placeholder="Juan"
            value={editForm.firstName}
            onChange={(v) => setEditForm({ ...editForm, firstName: v })}
            hasError={saveStatus?.type === "error" && saveStatus.message.includes("First Name")}
          />
          <FormField
            label="Middle Name"
            placeholder="Santos"
            value={editForm.middleName}
            onChange={(v) => setEditForm({ ...editForm, middleName: v })}
          />
          <FormField
            label="Last Name"
            required
            placeholder="Dela Cruz"
            value={editForm.lastName}
            onChange={(v) => setEditForm({ ...editForm, lastName: v })}
            hasError={saveStatus?.type === "error" && saveStatus.message.includes("Last Name")}
          />
          <DateField
            label="Date of Birth"
            value={editForm.birthDate}
            onChange={(v) => setEditForm({ ...editForm, birthDate: v })}
          />
          <FormField
            label="Email"
            type="email"
            required
            placeholder="juan.delacruz@email.com"
            value={editForm.personalEmail}
            onChange={(v) => setEditForm({ ...editForm, personalEmail: v })}
            hasError={saveStatus?.type === "error" && saveStatus.message.includes("Email")}
          />
          <FormField
            label="Religion"
            placeholder="e.g. Roman Catholic"
            value={editForm.religion}
            onChange={(v) => setEditForm({ ...editForm, religion: v })}
          />
          <PhoneField
            label="Phone"
            prefix="+63-"
            placeholder="78-000-0000"
            maxDigits={9}
            grouping={[2, 3, 4]}
            value={editForm.phoneNumber}
            onChange={(v) => setEditForm({ ...editForm, phoneNumber: v })}
          />
          <PhoneField
            label="Mobile"
            prefix="+63-"
            placeholder="900-000-0000"
            maxDigits={10}
            grouping={[3, 3, 4]}
            value={editForm.mobileNumber}
            onChange={(v) => setEditForm({ ...editForm, mobileNumber: v })}
          />
          <div className="col-span-2">
            <FormField
              label="Address"
              placeholder="123 Main St, Baguio City, Benguet"
              value={editForm.address}
              onChange={(v) => setEditForm({ ...editForm, address: v })}
            />
          </div>
        </div>

        {saveStatus?.type === "error" && (
          <p className="flex items-center gap-2 text-sm font-medium text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {saveStatus.message}
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={isSaving}>
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function FormField({
  label,
  type = "text",
  required = false,
  placeholder,
  value,
  onChange,
  hasError = false,
}: {
  label: string
  type?: string
  required?: boolean
  placeholder?: string
  value: string
  onChange: (value: string) => void
  hasError?: boolean
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </label>
      <Input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={hasError}
      />
    </div>
  )
}

function DateField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  const [open, setOpen] = React.useState(false)
  const selected = value ? new Date(value) : undefined

  return (
    <div className="flex">
      <div className="flex-1">
        <label className="mb-2 block text-sm font-medium">{label}</label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start rounded-r-none font-normal"
            >
              <CalendarIcon className="h-4 w-4" />
              {selected ? (
                format(selected, "MMMM d, yyyy")
              ) : (
                <span className="text-muted-foreground">Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selected}
              captionLayout="dropdown"
              onSelect={(date) => {
                onChange(date ? format(date, "yyyy-MM-dd") : "")
                setOpen(false)
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium">Age</label>
        <span className="flex h-9 w-14 items-center justify-center rounded-r-md border border-l-0 border-input bg-muted px-2.5 text-sm text-foreground select-none">
          {calculateAge(value)}
        </span>
      </div>
    </div>
  )
}

function extractDigits(value: string): string {
  let digits = value.replace(/\D/g, "")
  if (digits.startsWith("63")) digits = digits.slice(2)
  if (digits.startsWith("0")) digits = digits.slice(1)
  return digits
}

function formatDigits(raw: string, grouping: number[]): string {
  let result = ""
  let i = 0
  for (const size of grouping) {
    if (i >= raw.length) break
    if (result) result += "-"
    result += raw.slice(i, i + size)
    i += size
  }
  if (i < raw.length) {
    if (result) result += "-"
    result += raw.slice(i)
  }
  return result
}

function PhoneField({
  label,
  prefix,
  placeholder,
  maxDigits,
  grouping,
  value,
  onChange,
}: {
  label: string
  prefix: string
  placeholder: string
  maxDigits: number
  grouping: number[]
  value: string
  onChange: (value: string) => void
}) {
  const rawDigits = React.useMemo(() => extractDigits(value), [value])
  const formatted = React.useMemo(() => formatDigits(rawDigits, grouping), [rawDigits, grouping])

  return (
    <div>
      <label className="mb-2 block text-sm font-medium">{label}</label>
      <div className="flex">
        <span className="flex h-9 items-center rounded-l-md border border-r-0 border-input bg-muted px-2.5 text-sm text-muted-foreground select-none">
          {prefix}
        </span>
        <Input
          type="tel"
          inputMode="numeric"
          pattern="[0-9-]*"
          value={formatted}
          placeholder={placeholder}
          onChange={(e) => {
            const raw = e.target.value.replace(/\D/g, "").slice(0, maxDigits)
            onChange(raw ? `${prefix}${formatDigits(raw, grouping)}` : "")
          }}
          className="rounded-l-none"
        />
      </div>
    </div>
  )
}
