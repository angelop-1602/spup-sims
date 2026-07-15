import { STATUS_STYLES, type ApplicantMePayload } from "./types"

interface ProfileBannerProps {
  profile: ApplicantMePayload["profile"]
  status?: string
  createdAt: string
}

export function ProfileBanner({ profile, status, createdAt }: ProfileBannerProps) {
  const statusStyle = STATUS_STYLES[status || "Submitted"] ?? "bg-neutral-100 text-neutral-600"
  const createdString = new Date(createdAt || Date.now()).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric"
  })

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 shrink-0 rounded-full bg-[#373A40] text-white flex items-center justify-center text-lg font-semibold uppercase">
          {profile.firstName && profile.lastName
            ? `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`
            : "—"}
        </div>
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-neutral-950">
            {profile.firstName} {profile.lastName}
          </h1>
          <p className="text-sm text-neutral-500">{profile.personalEmail || "—"}</p>
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyle}`}>
              {status || "Draft"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground pt-1">
            Profile #{profile.id} · Created {createdString}
          </p>
        </div>
      </div>
    </div>
  )
}