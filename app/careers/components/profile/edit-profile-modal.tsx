"use client"

import * as React from "react"
import { CalendarIcon, AlertCircle, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { z } from "zod"

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

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "").replace(/^63/, "")
}

const NAME_PATTERN = /^[A-Za-z\s'-]+$/

const profileSchema = z.object({
  firstName: z.string().trim().min(1, "First Name is required.").regex(NAME_PATTERN, "Enter a valid name."),
  middleName: z.string().refine((v) => !v.trim() || NAME_PATTERN.test(v), "Enter a valid name."),
  lastName: z.string().trim().min(1, "Last Name is required.").regex(NAME_PATTERN, "Enter a valid name."),
  suffix: z.string().refine((v) => !v.trim() || NAME_PATTERN.test(v), "Enter a valid suffix."),
  gender: z.string().refine((v) => ["0", "1", "2", "3"].includes(v), "Select a valid gender."),
  birthDate: z
    .string()
    .trim()
    .min(1, "Date of Birth is required.")
    .refine((v) => new Date(v) <= new Date(), "Enter a valid date of birth."),
  civilStatus: z.string().refine((v) => ["0", "1", "2", "3", "4"].includes(v), "Select a valid civil status."),
  religion: z.string().refine((v) => !v.trim() || NAME_PATTERN.test(v), "Enter a valid religion."),
  qualifier: z.string().refine((v) => !v.trim() || /^[A-Za-z0-9\s.'-]+$/.test(v), "Enter a valid qualifier."),
  personalEmail: z.email("Enter a valid email address."),
  phoneNumber: z
    .string()
    .refine((v) => !v || digitsOnly(v).length === 9, "Enter a valid phone number."),
  mobileNumber: z
    .string()
    .refine((v) => !v || digitsOnly(v).length === 10, "Enter a valid mobile number."),
  address: z
    .string()
    .refine((v) => !v.trim() || /[A-Za-z0-9]/.test(v), "Enter a valid address."),
})

type FieldErrors = Partial<Record<keyof ProfileUpdateForm, string>>

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
  const [fieldErrors, setFieldErrors] = React.useState<FieldErrors>({})

  const handleSave = () => {
    const result = profileSchema.safeParse(editForm)
    if (!result.success) {
      const flat = z.flattenError(result.error).fieldErrors
      setFieldErrors({
        firstName: flat.firstName?.[0],
        middleName: flat.middleName?.[0],
        lastName: flat.lastName?.[0],
        suffix: flat.suffix?.[0],
        gender: flat.gender?.[0],
        birthDate: flat.birthDate?.[0],
        civilStatus: flat.civilStatus?.[0],
        religion: flat.religion?.[0],
        qualifier: flat.qualifier?.[0],
        personalEmail: flat.personalEmail?.[0],
        phoneNumber: flat.phoneNumber?.[0],
        mobileNumber: flat.mobileNumber?.[0],
        address: flat.address?.[0],
      })
      return
    }
    setFieldErrors({})
    onSave()
  }

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
            error={fieldErrors.firstName}
          />
          <FormField
            label="Middle Name"
            placeholder="Santos"
            value={editForm.middleName}
            onChange={(v) => setEditForm({ ...editForm, middleName: v })}
            error={fieldErrors.middleName}
          />
          <FormField
            label="Last Name"
            required
            placeholder="Dela Cruz"
            value={editForm.lastName}
            onChange={(v) => setEditForm({ ...editForm, lastName: v })}
            error={fieldErrors.lastName}
          />
          <FormField
            label="Suffix"
            placeholder="Jr, III, etc."
            value={editForm.suffix}
            onChange={(v) => setEditForm({ ...editForm, suffix: v })}
            error={fieldErrors.suffix}
          />
          <DateField
            label="Date of Birth"
            required
            value={editForm.birthDate}
            onChange={(v) => setEditForm({ ...editForm, birthDate: v })}
            error={fieldErrors.birthDate}
          />
          <SelectField
            label="Gender"
            value={editForm.gender}
            onValueChange={(v) => setEditForm({ ...editForm, gender: v })}
            placeholder="Select gender"
            options={[
              { value: "0", label: "Unspecified" },
              { value: "1", label: "Female" },
              { value: "2", label: "Male" },
              { value: "3", label: "Other" },
            ]}
            error={fieldErrors.gender}
          />
          <SelectField
            label="Civil Status"
            value={editForm.civilStatus}
            onValueChange={(v) => setEditForm({ ...editForm, civilStatus: v })}
            placeholder="Select civil status"
            options={[
              { value: "0", label: "Unspecified" },
              { value: "1", label: "Single" },
              { value: "2", label: "Married" },
              { value: "3", label: "Widowed" },
              { value: "4", label: "Separated" }
            ]}
            error={fieldErrors.civilStatus}
          />
          <FormField
            label="Religion"
            placeholder="e.g. Roman Catholic"
            value={editForm.religion}
            onChange={(v) => setEditForm({ ...editForm, religion: v })}
            error={fieldErrors.religion}
          />
          <FormField
            label="Qualifier"
            placeholder="e.g. DIT, MIT"
            value={editForm.qualifier}
            onChange={(v) => setEditForm({ ...editForm, qualifier: v })}
            error={fieldErrors.qualifier}
          />
          <FormField
            label="Email"
            type="email"
            required
            placeholder="juan.delacruz@email.com"
            value={editForm.personalEmail}
            onChange={(v) => setEditForm({ ...editForm, personalEmail: v })}
            error={fieldErrors.personalEmail}
          />
          <PhoneField
            label="Phone"
            prefix="+63-"
            placeholder="78-000-0000"
            maxDigits={9}
            grouping={[2, 3, 4]}
            value={editForm.phoneNumber}
            onChange={(v) => setEditForm({ ...editForm, phoneNumber: v })}
            error={fieldErrors.phoneNumber}
          />
          <PhoneField
            label="Mobile"
            prefix="+63-"
            placeholder="900-000-0000"
            maxDigits={10}
            grouping={[3, 3, 4]}
            value={editForm.mobileNumber}
            onChange={(v) => setEditForm({ ...editForm, mobileNumber: v })}
            error={fieldErrors.mobileNumber}
          />
          <div className="col-span-2">
            <FormField
              label="Address"
              placeholder="e.g. Mabini Street, Ugac Norte, Tuguegarao City, Cagayan"
              value={editForm.address}
              onChange={(v) => setEditForm({ ...editForm, address: v })}
              error={fieldErrors.address}
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
          <Button onClick={handleSave} disabled={isSaving}>
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
  error,
}: {
  label: string
  type?: string
  required?: boolean
  placeholder?: string
  value: string
  onChange: (value: string) => void
  error?: string
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
        aria-invalid={!!error}
      />
      {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
    </div>
  )
}

function DateField({
  label,
  required = false,
  value,
  onChange,
  error,
}: {
  label: string
  required?: boolean
  value: string
  onChange: (value: string) => void
  error?: string
}) {
  const [open, setOpen] = React.useState(false)
  const selected = value ? new Date(value) : undefined

  return (
    <div>
      <div className="flex">
        <div className="flex-1">
          <label className="mb-2 block text-sm font-medium">
            {label}
            {required && <span className="ml-0.5 text-destructive">*</span>}
          </label>
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
                disabled={{ after: new Date() }}
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
      {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
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
  error,
}: {
  label: string
  prefix: string
  placeholder: string
  maxDigits: number
  grouping: number[]
  value: string
  onChange: (value: string) => void
  error?: string
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
          aria-invalid={!!error}
        />
      </div>
      {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
    </div>
  )
}

function SelectField({
  label,
  value,
  onValueChange,
  placeholder,
  options,
  error,
}: {
  label: string
  value: string
  onValueChange: (value: string) => void
  placeholder: string
  options: { value: string; label: string }[]
  error?: string
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium">{label}</label>
      <select
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className="flex h-9 w-full items-center rounded-md border border-input bg-transparent px-2.5 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20"
        aria-invalid={!!error}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
    </div>
  )
}
