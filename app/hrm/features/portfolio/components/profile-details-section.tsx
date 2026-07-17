import { Card, CardContent, CardHeader } from "@/components/ui/card"
import type { components } from "@/lib/api"
import { formatPortfolioDate } from "../utils/format-portfolio-date"

type Employee = components["schemas"]["EmployeeResponse"]

const GENDER_LABELS: Record<number, string> = {
  0: "Male",
  1: "Female",
}

const CIVIL_STATUS_LABELS: Record<number, string> = {
  0: "Single",
  1: "Married",
  2: "Separated",
  3: "Widowed",
  4: "Divorced",
}

function formatEnumLabel(
  value: number | string | null | undefined,
  labels: Record<number, string>,
) {
  if (value == null) return undefined
  return labels[Number(value)] ?? String(value)
}

type DetailField = {
  label: string
  value: string | number | null | undefined
}

function DetailGroup({ title, fields }: { title: string; fields: DetailField[] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <dl className="mt-3 grid gap-x-6 gap-y-4 sm:grid-cols-2 xl:grid-cols-3">
        {fields.map((field) => (
          <div key={field.label} className="min-w-0">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {field.label}
            </dt>
            <dd className="mt-1 break-words text-sm font-medium">
              {field.value === "" || field.value == null ? "—" : field.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

export function ProfileDetailsSection({ profile }: { profile: Employee }) {
  const personalFields: DetailField[] = [
    { label: "Full name", value: profile.fullName },
    { label: "Email", value: profile.email },
    { label: "Age", value: profile.age },
    { label: "Gender", value: formatEnumLabel(profile.gender, GENDER_LABELS) },
    {
      label: "Civil status",
      value: formatEnumLabel(profile.civilStatus, CIVIL_STATUS_LABELS),
    },
    { label: "Mobile number", value: profile.mobileNumber },
    { label: "Phone number", value: profile.phoneNumber },
    { label: "Religion", value: profile.religion },
  ]

  const employmentFields: DetailField[] = [
    { label: "Employee number", value: profile.employeeNumber },
    { label: "Employee type", value: profile.employeeType },
    { label: "Position / designation", value: profile.position },
    { label: "Department / office", value: profile.department },
    { label: "Supervisor", value: profile.supervisor },
    { label: "Employment status", value: String(profile.employmentStatus) },
    { label: "Employment category", value: String(profile.employmentCategory) },
    { label: "Date hired", value: formatPortfolioDate(profile.dateHired) },
    { label: "Regularization date", value: formatPortfolioDate(profile.dateRegularized) },
    { label: "Separation date", value: formatPortfolioDate(profile.dateSeparated) },
    { label: "Active status", value: profile.isActive ? "Active" : "Inactive" },
    { label: "Shared profile", value: profile.shared ? "Yes" : "No" },
  ]

  return (
    <section
      id="profile-details"
      aria-labelledby="profile-details-heading"
      className="scroll-mt-36 print:scroll-mt-0"
    >
      <Card className="gap-0 py-0 shadow-none print:break-inside-avoid">
        <CardHeader className="border-b px-4 py-4 sm:px-5">
          <h2 id="profile-details-heading" className="text-base font-semibold">
            Profile Details
          </h2>
          <p className="text-sm text-muted-foreground">
            Personal, contact, and employment information.
          </p>
        </CardHeader>
        <CardContent className="grid gap-6 p-4 sm:p-5 lg:grid-cols-2">
          <DetailGroup title="Personal information" fields={personalFields} />
          <DetailGroup title="Employment information" fields={employmentFields} />
        </CardContent>
      </Card>
    </section>
  )
}
